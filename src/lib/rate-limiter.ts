interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanup();
  }

  private cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.attempts.entries()) {
        if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
          this.attempts.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // Check if blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
      };
    }

    // Reset if window expired
    if (!entry || entry.resetTime < now) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.attempts.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.config.maxAttempts) {
      if (this.config.blockDurationMs) {
        entry.blockedUntil = now + this.config.blockDurationMs;
      }
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil || entry.resetTime,
      };
    }

    return {
      allowed: true,
      remaining: this.config.maxAttempts - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// Login rate limiter: 5 attempts per 15 minutes, block for 30 minutes
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
});

// API rate limiter: 100 requests per minute
export const apiRateLimiter = new RateLimiter({
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minute
});

// Password reset rate limiter: 3 attempts per hour
export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour
});

export function getClientIdentifier(): string {
  // In production, use IP address from server
  // For client-side, use a combination of factors
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.colorDepth,
    screen.width + 'x' + screen.height,
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString(36);
}
