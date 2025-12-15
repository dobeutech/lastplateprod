import { config } from './config';
import { captureError, captureMessage, addBreadcrumb } from './monitoring';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private isProduction: boolean;
  private logLevel: LogLevel;

  constructor() {
    this.isProduction = config.environment === 'production';
    this.logLevel = this.isProduction ? 'warn' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
      
      if (context?.component) {
        addBreadcrumb(message, context.component, context);
      }
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
      
      if (context?.component) {
        addBreadcrumb(message, context.component, context);
      }
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
      
      if (this.isProduction) {
        captureMessage(message, 'warning', {
          extra: context,
        });
      }
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context), error);
      
      if (this.isProduction) {
        if (error) {
          captureError(error, {
            extra: { message, ...context },
          });
        } else {
          captureMessage(message, 'error', {
            extra: context,
          });
        }
      }
    }
  }

  // Audit logging for security-sensitive operations
  audit(action: string, context: LogContext) {
    const auditMessage = `AUDIT: ${action}`;
    console.info(this.formatMessage('info', auditMessage, context));
    
    if (this.isProduction) {
      captureMessage(auditMessage, 'info', {
        tags: { type: 'audit', action },
        extra: context,
      });
    }
  }

  // Performance logging
  performance(operation: string, durationMs: number, context?: LogContext) {
    const perfMessage = `PERF: ${operation} took ${durationMs}ms`;
    
    if (durationMs > 1000) {
      this.warn(perfMessage, { ...context, durationMs });
    } else {
      this.debug(perfMessage, { ...context, durationMs });
    }
  }
}

export const logger = new Logger();

// Convenience wrapper for timing operations
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.performance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operation} failed after ${duration}ms`, error as Error, context);
    throw error;
  }
}

// Decorator for class methods (if using TypeScript decorators)
export function logPerformance(target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const start = performance.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      logger.performance(`${propertyKey}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`${propertyKey} failed after ${duration}ms`, error as Error);
      throw error;
    }
  };

  return descriptor;
}
