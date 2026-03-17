/**
 * CSRF (Cross-Site Request Forgery) Protection Utility
 * 
 * Generates and validates CSRF tokens for state-changing operations.
 * Uses Double Submit Cookie pattern for protection.
 */

import { logger } from './logger';

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in localStorage (for SPA usage)
 * Note: In production, consider using httpOnly cookies for better security
 */
export function storeCSRFToken(token: string): void {
  try {
    localStorage.setItem(CSRF_TOKEN_KEY, token);
    
    // Also set as cookie for double-submit pattern
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24 hour expiry
    document.cookie = `csrf_token=${token}; expires=${expiry.toUTCString()}; path=/; SameSite=Strict`;
  } catch (error) {
    logger.error('Failed to store CSRF token', { error });
  }
}

/**
 * Get stored CSRF token
 */
export function getCSRFToken(): string | null {
  try {
    // Try localStorage first
    const token = localStorage.getItem(CSRF_TOKEN_KEY);
    if (token) return token;
    
    // Fallback to cookie
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(c => c.trim().startsWith('csrf_token='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  } catch (error) {
    logger.error('Failed to get CSRF token', { error });
    return null;
  }
}

/**
 * Clear stored CSRF token
 */
export function clearCSRFToken(): void {
  try {
    localStorage.removeItem(CSRF_TOKEN_KEY);
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch (error) {
    logger.error('Failed to clear CSRF token', { error });
  }
}

/**
 * Initialize CSRF protection for the session
 * Call this on app initialization or after login
 */
export function initializeCSRF(): string {
  const token = generateCSRFToken();
  storeCSRFToken(token);
  logger.info('CSRF token initialized');
  return token;
}

/**
 * Get headers for authenticated requests with CSRF token
 */
export function getCSRFHeaders(): Record<string, string> {
  const token = getCSRFToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers[CSRF_HEADER] = token;
  }
  
  return headers;
}

/**
 * Fetch wrapper with CSRF protection
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getCSRFToken();
  
  // Initialize token if not exists
  if (!token) {
    initializeCSRF();
  }
  
  const headers = {
    ...options.headers,
    ...getCSRFHeaders(),
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If 403 Forbidden (CSRF validation failed), clear token and retry once
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error?.includes('CSRF')) {
      logger.warn('CSRF validation failed, retrying with new token');
      clearCSRFToken();
      initializeCSRF();
      
      // Retry with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          ...getCSRFHeaders(),
        },
      });
    }
  }
  
  return response;
}

/**
 * Validate CSRF token on server side
 * Note: This should be used in API route handlers
 */
export function validateCSRFToken(
  requestToken: string | null,
  cookieToken: string | null
): boolean {
  if (!requestToken || !cookieToken) {
    return false;
  }
  
  // Compare tokens using timing-safe comparison
  try {
    const encoder = new TextEncoder();
    const reqTokenBuf = encoder.encode(requestToken);
    const cookieTokenBuf = encoder.encode(cookieToken);
    
    if (reqTokenBuf.length !== cookieTokenBuf.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < reqTokenBuf.length; i++) {
      result |= reqTokenBuf[i] ^ cookieTokenBuf[i];
    }
    
    return result === 0;
  } catch (error) {
    logger.error('CSRF validation error', { error });
    return false;
  }
}

/**
 * Higher-order function to protect API routes with CSRF
 * For use in serverless functions
 */
export function withCSRFProtection<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (req: any, res: any, ...args: any[]) => {
    // Skip CSRF for GET requests (they should be idempotent)
    if (req.method === 'GET') {
      return handler(req, res, ...args);
    }
    
    const csrfHeader = req.headers[CSRF_HEADER.toLowerCase()] || req.headers[CSRF_HEADER];
    const csrfCookie = req.cookies?.csrf_token;
    
    if (!validateCSRFToken(csrfHeader, csrfCookie)) {
      return res.status(403).json({
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token',
      });
    }
    
    return handler(req, res, ...args);
  }) as T;
}

// React hook for CSRF
export function useCSRF() {
  return {
    getToken: getCSRFToken,
    initialize: initializeCSRF,
    clear: clearCSRFToken,
    getHeaders: getCSRFHeaders,
    fetch: fetchWithCSRF,
  };
}

export default {
  generateToken: generateCSRFToken,
  storeToken: storeCSRFToken,
  getToken: getCSRFToken,
  clearToken: clearCSRFToken,
  initialize: initializeCSRF,
  getHeaders: getCSRFHeaders,
  fetch: fetchWithCSRF,
  validate: validateCSRFToken,
  withCSRFProtection,
  CSRF_HEADER,
};