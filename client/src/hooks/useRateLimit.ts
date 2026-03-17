import { useState, useCallback, useRef, useEffect } from 'react';
import {
  apiRateLimiter,
  formRateLimiter,
  whatsappRateLimiter,
  searchRateLimiter,
  type RateLimiter,
} from '@/lib/rateLimit';

export interface RateLimitState {
  isRateLimited: boolean;
  remaining: number;
  limit: number;
  retryAfter: number | null;
  resetTime: number | null;
}

export interface UseRateLimitOptions {
  /** Rate limiter instance to use */
  limiter: RateLimiter;
  /** Unique key for this rate limit */
  key?: string;
  /** Callback when rate limit is exceeded */
  onRateLimit?: (retryAfter: number) => void;
  /** Callback when rate limit is reset */
  onReset?: () => void;
}

/**
 * React hook for rate limiting in frontend
 * 
 * Usage:
 * ```tsx
 * const { checkRateLimit, rateLimitState, resetRateLimit } = useRateLimit({
 *   limiter: formRateLimiter,
 *   key: 'inquiry_form',
 *   onRateLimit: (seconds) => alert(`Please wait ${seconds} seconds`),
 * });
 * 
 * const handleSubmit = async () => {
 *   if (!await checkRateLimit()) return;
 *   // Proceed with submission
 * };
 * ```
 */
export function useRateLimit(options: UseRateLimitOptions) {
  const { limiter, key, onRateLimit, onReset } = options;
  
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    remaining: 0, // Will be set on first check
    limit: 0,
    retryAfter: null,
    resetTime: null,
  });

  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize status on mount
  useEffect(() => {
    limiter.getStatus(key).then(status => {
      setRateLimitState(prev => ({
        ...prev,
        remaining: status.remaining,
        limit: status.limit,
        resetTime: status.resetTime,
      }));
    });
  }, [limiter, key]);

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    const result = await limiter.check(key);

    setRateLimitState({
      isRateLimited: !result.allowed,
      remaining: result.remaining,
      limit: result.limit,
      retryAfter: result.retryAfter || null,
      resetTime: result.resetTime,
    });

    if (!result.allowed) {
      onRateLimit?.(result.retryAfter!);
      
      // Set up auto-reset timer
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      
      resetTimerRef.current = setTimeout(() => {
        setRateLimitState(prev => ({
          ...prev,
          isRateLimited: false,
          retryAfter: null,
        }));
        onReset?.();
      }, result.retryAfter! * 1000);

      return false;
    }

    return true;
  }, [limiter, key, onRateLimit, onReset]);

  const resetRateLimit = useCallback(() => {
    limiter.reset(key);
    limiter.getStatus(key).then(status => {
      setRateLimitState({
        isRateLimited: false,
        remaining: status.remaining,
        limit: status.limit,
        retryAfter: null,
        resetTime: status.resetTime,
      });
    });
    onReset?.();
  }, [limiter, key, onReset]);

  const getFormattedRetryAfter = useCallback((): string => {
    if (!rateLimitState.retryAfter) return '';
    
    const minutes = Math.floor(rateLimitState.retryAfter / 60);
    const seconds = rateLimitState.retryAfter % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [rateLimitState.retryAfter]);

  return {
    checkRateLimit,
    resetRateLimit,
    rateLimitState,
    formattedRetryAfter: getFormattedRetryAfter(),
    canProceed: !rateLimitState.isRateLimited,
  };
}

/**
 * Hook for form submission rate limiting
 */
export function useFormRateLimit(
  formKey: string,
  onRateLimit?: (retryAfter: number) => void
) {
  return useRateLimit({
    limiter: formRateLimiter,
    key: `form_${formKey}`,
    onRateLimit,
  });
}

/**
 * Hook for API call rate limiting
 */
export function useApiRateLimit(
  endpoint: string,
  onRateLimit?: (retryAfter: number) => void
) {
  return useRateLimit({
    limiter: apiRateLimiter,
    key: `api_${endpoint}`,
    onRateLimit,
  });
}

/**
 * Hook for WhatsApp rate limiting
 */
export function useWhatsAppRateLimit(onRateLimit?: (retryAfter: number) => void) {
  return useRateLimit({
    limiter: whatsappRateLimiter,
    key: 'whatsapp_click',
    onRateLimit,
  });
}

/**
 * Hook for search rate limiting
 */
export function useSearchRateLimit(onRateLimit?: (retryAfter: number) => void) {
  return useRateLimit({
    limiter: searchRateLimiter,
    key: 'property_search',
    onRateLimit,
  });
}

export default useRateLimit;