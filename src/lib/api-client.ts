import { supabase } from './supabase';
import { config } from './config';
import { logger } from './logger';
import { apiRateLimiter, getClientIdentifier } from './rate-limiter';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  skipRateLimit?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.supabaseUrl;
  }

  private async checkRateLimit() {
    const clientId = getClientIdentifier();
    const rateLimitCheck = apiRateLimiter.check(clientId);

    if (!rateLimitCheck.allowed) {
      const waitSeconds = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000);
      throw new ApiError(
        `Rate limit exceeded. Please try again in ${waitSeconds} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT');
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = config.apiTimeout,
      skipRateLimit = false,
    } = options;

    // Check rate limiting
    if (!skipRateLimit) {
      await this.checkRateLimit();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const startTime = performance.now();

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: Record<string, string> = {};
      
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await this.fetchWithTimeout(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        },
        timeout
      );

      const duration = performance.now() - startTime;
      logger.performance(`API ${method} ${endpoint}`, duration, {
        component: 'ApiClient',
        statusCode: response.status,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Request failed with status ${response.status}`,
          response.status,
          errorData.code,
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      if (error instanceof ApiError) {
        logger.error(
          `API ${method} ${endpoint} failed`,
          error,
          {
            component: 'ApiClient',
            statusCode: error.statusCode,
            duration,
          }
        );
        throw error;
      }

      logger.error(
        `API ${method} ${endpoint} failed`,
        error as Error,
        {
          component: 'ApiClient',
          duration,
        }
      );

      throw new ApiError(
        'An unexpected error occurred',
        500,
        'INTERNAL_ERROR',
        error
      );
    }
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown): never {
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string; details?: string };
    
    logger.error('Supabase error', new Error(supabaseError.message), {
      component: 'Supabase',
      code: supabaseError.code,
      details: supabaseError.details,
    });

    throw new ApiError(
      supabaseError.message,
      400,
      supabaseError.code,
      supabaseError.details
    );
  }

  throw new ApiError('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

// Retry logic for failed requests
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx) except 429
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, {
          component: 'ApiClient',
          error: lastError.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
