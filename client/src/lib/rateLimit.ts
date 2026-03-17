/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting for API routes and client-side actions.
 * Supports both in-memory (client-side) and Redis/Supabase (server-side) storage.
 */

import { logger } from './logger';

// Rate limit configuration
export interface RateLimitConfig {
  // Maximum number of requests allowed within the interval
  maxRequests: number;
  // Time window in milliseconds
  windowMs: number;
  // Optional: Unique key generator function
  keyGenerator?: () => string;
  // Optional: Skip rate limiting for certain conditions
  skip?: () => boolean;
  // Optional: Custom error message
  errorMessage?: string;
}

// Default configurations for different use cases
export const RATE_LIMIT_CONFIGS = {
  // For API routes (stricter)
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many requests, please try again later.',
  },
  // For authentication endpoints (very strict)
  AUTH: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many login attempts, please try again later.',
  },
  // For form submissions
  FORM: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many submissions, please slow down.',
  },
  // For WhatsApp clicks (prevent spam)
  WHATSAPP: {
    maxRequests: 3,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Please wait before clicking again.',
  },
  // For property searches
  SEARCH: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many searches, please slow down.',
  },
} as const;

// Rate limit entry
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Storage interface
interface RateLimitStorage {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
}

// In-memory storage (for client-side)
class MemoryStorage implements RateLimitStorage {
  private store = new Map<string, RateLimitEntry>();

  get(key: string): RateLimitEntry | undefined {
    this.cleanup();
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    this.store.forEach((entry, key) => {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    });
  }
}

// Rate limiter class
export class RateLimiter {
  private storage: RateLimitStorage;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig, storage?: RateLimitStorage) {
    this.config = config;
    this.storage = storage || new MemoryStorage();
  }

  /**
   * Check if the request should be rate limited
   */
  async check(key?: string): Promise<{
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    // Check if should skip
    if (this.config.skip?.()) {
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
      };
    }

    const identifier = key || this.config.keyGenerator?.() || 'default';
    const now = Date.now();
    
    let entry = this.storage.get(identifier);

    // If no entry or entry expired, create new
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.storage.set(identifier, entry);

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      logger.warn('Rate limit exceeded', {
        key: identifier,
        count: entry.count,
        limit: this.config.maxRequests,
        retryAfter,
      });

      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    entry.count++;
    this.storage.set(identifier, entry);

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(key?: string): Promise<{
    limit: number;
    remaining: number;
    resetTime: number;
  }> {
    const identifier = key || this.config.keyGenerator?.() || 'default';
    const now = Date.now();
    
    const entry = this.storage.get(identifier);

    if (!entry || entry.resetTime < now) {
      return {
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    return {
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key?: string): void {
    const identifier = key || this.config.keyGenerator?.() || 'default';
    this.storage.delete(identifier);
  }
}

// Create rate limiter instances for different use cases
export const apiRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.API);
export const authRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.AUTH);
export const formRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.FORM);
export const whatsappRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.WHATSAPP);
export const searchRateLimiter = new RateLimiter(RATE_LIMIT_CONFIGS.SEARCH);

/**
 * Higher-order function to wrap API calls with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limiter: RateLimiter,
  key?: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const result = await limiter.check(key);
    
    if (!result.allowed) {
      const error = new Error(limiter['config'].errorMessage || 'Rate limit exceeded');
      (error as any).statusCode = 429;
      (error as any).retryAfter = result.retryAfter;
      throw error;
    }

    return fn(...args);
  }) as T;
}

/**
 * React hook for client-side rate limiting
 */
export function createRateLimitHook(limiter: RateLimiter) {
  return function useRateLimit(key?: string) {
    const check = async () => {
      const result = await limiter.check(key);
      return result;
    };

    const getStatus = async () => {
      const result = await limiter.getStatus(key);
      return result;
    };

    const reset = () => {
      limiter.reset(key);
    };

    return {
      check,
      getStatus,
      reset,
    };
  };
}

// Export hook instances
export const useApiRateLimit = createRateLimitHook(apiRateLimiter);
export const useAuthRateLimit = createRateLimitHook(authRateLimiter);
export const useFormRateLimit = createRateLimitHook(formRateLimiter);
export const useWhatsappRateLimit = createRateLimitHook(whatsappRateLimiter);

// Default export
export default {
  RateLimiter,
  withRateLimit,
  apiRateLimiter,
  authRateLimiter,
  formRateLimiter,
  whatsappRateLimiter,
  searchRateLimiter,
  configs: RATE_LIMIT_CONFIGS,
};