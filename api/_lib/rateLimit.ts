/**
 * Server-side Rate Limiting for API Routes
 * 
 * Uses Vercel Edge Config or in-memory storage for rate limiting.
 * For production, consider using Redis or similar.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limit configuration
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  errorMessage?: string;
}

// Predefined configs
export const RATE_LIMITS = {
  DEFAULT: { maxRequests: 100, windowMs: 60 * 1000 },
  STRICT: { maxRequests: 10, windowMs: 60 * 1000 },
  LENIENT: { maxRequests: 1000, windowMs: 60 * 1000 },
  UPLOAD: { maxRequests: 5, windowMs: 60 * 1000 },
  CHAT: { maxRequests: 20, windowMs: 60 * 1000 },
} as const;

// In-memory storage (resets on deployment)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60 * 1000); // Clean up every minute

/**
 * Get client IP from request
 */
function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded 
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket?.remoteAddress || 'unknown';
  return ip;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  req: VercelRequest,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> {
  const identifier = getClientIp(req);
  const key = `${req.url}:${identifier}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Create new entry if not exists or expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Middleware to apply rate limiting to API route
 */
export function withRateLimit(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    const result = await checkRateLimit(req, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.resetTime.toString());

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter?.toString() || '60');
      res.status(429).json({
        error: config.errorMessage || 'Too many requests',
        retryAfter: result.retryAfter,
      });
      return;
    }

    await handler(req, res);
  };
}

/**
 * Higher-order function for specific route handlers
 */
export function createRateLimitedHandler(
  config: RateLimitConfig = RATE_LIMITS.DEFAULT
) {
  return (
    handler: (req: VercelRequest, res: VercelResponse) => Promise<void>
  ) => withRateLimit(handler, config);
}

// Export pre-configured handlers
export const withDefaultRateLimit = createRateLimitedHandler(RATE_LIMITS.DEFAULT);
export const withStrictRateLimit = createRateLimitedHandler(RATE_LIMITS.STRICT);
export const withUploadRateLimit = createRateLimitedHandler(RATE_LIMITS.UPLOAD);
export const withChatRateLimit = createRateLimitedHandler(RATE_LIMITS.CHAT);

export default {
  checkRateLimit,
  withRateLimit,
  RATE_LIMITS,
  withDefaultRateLimit,
  withStrictRateLimit,
  withUploadRateLimit,
  withChatRateLimit,
};