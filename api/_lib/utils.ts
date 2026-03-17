// Shared utilities for Vercel Serverless Functions

// Rate limiting store (in-memory for serverless, will reset on cold starts)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMITS = {
  DEFAULT: { windowMs: 60000, maxRequests: 100 },
  API_HEAVY: { windowMs: 60000, maxRequests: 30 },
  IMAGE_UPLOAD: { windowMs: 60000, maxRequests: 10 },
};

// CSRF Token validation
const CSRF_HEADER = 'x-csrf-token';

export function checkRateLimit(clientIP: string, endpoint: string, limitType: keyof typeof RATE_LIMITS = 'DEFAULT') {
  const key = `${clientIP}:${endpoint}`;
  const now = Date.now();
  const limit = RATE_LIMITS[limitType];

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return { allowed: true, remaining: limit.maxRequests - 1 };
  }

  const userLimit = rateLimitStore.get(key)!;

  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + limit.windowMs;
    return { allowed: true, remaining: limit.maxRequests - 1 };
  }

  if (userLimit.count >= limit.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userLimit.resetTime
    };
  }

  userLimit.count++;
  return {
    allowed: true,
    remaining: limit.maxRequests - userLimit.count
  };
}

/**
 * Validate CSRF token from request headers
 * Returns true if valid or if request is GET/HEAD (safe methods)
 */
export function validateCSRF(req: any): boolean {
  // Skip CSRF for safe methods
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return true;
  }

  // Get token from header
  const csrfToken = req.headers[CSRF_HEADER] || req.headers['X-CSRF-Token'];
  
  // For serverless, we rely on the token being present in the header
  // In a full implementation, you'd also compare with a server-side session or signed cookie
  // This is a basic implementation - production should use double-submit cookie pattern
  
  if (!csrfToken) {
    console.warn('CSRF token missing in request');
    return false;
  }

  // Basic validation - token should be 64 chars (32 bytes hex)
  if (typeof csrfToken !== 'string' || csrfToken.length !== 64) {
    console.warn('Invalid CSRF token format');
    return false;
  }

  // Additional validation - check if it's valid hex
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (!hexRegex.test(csrfToken)) {
    console.warn('CSRF token contains invalid characters');
    return false;
  }

  return true;
}

/**
 * Middleware wrapper that adds CSRF protection
 */
export function withCSRFProtection(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    if (!validateCSRF(req)) {
      return res.status(403).json({
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
      });
    }
    return handler(req, res);
  };
}

// CORS configuration
const ALLOWED_ORIGINS = [
  'https://salambumi.xyz',
  'https://www.salambumi.xyz',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

export function getCORSHeaders(origin: string | null) {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': 'null',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

// Input sanitization functions
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';

  let sanitized = input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .trim();

  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function sanitizePhoneNumber(phone: string): string {
  let sanitized = phone.replace(/[^\d+]/g, '');

  if (sanitized.startsWith('0')) {
    sanitized = '+62' + sanitized.substring(1);
  } else if (sanitized.startsWith('62')) {
    sanitized = '+' + sanitized;
  } else if (!sanitized.startsWith('+')) {
    sanitized = '+62' + sanitized;
  }

  const phoneRegex = /^\+62[8-9]\d{7,11}$/;
  if (!phoneRegex.test(sanitized)) {
    throw new Error('Invalid Indonesian phone number format');
  }

  return sanitized;
}

// Security headers
export function getSecurityHeaders() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.googletagmanager.com https://*.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.googleapis.com https://*.google-analytics.com https://*.googletagmanager.com",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
}

// Extract keywords from text
export function extractKeywords(text: string, propertyType: string, province: string, district: string): string[] {
  const keywords = new Set<string>();

  if (propertyType) keywords.add(propertyType.toLowerCase());
  if (province) keywords.add(province.toLowerCase());
  if (district) keywords.add(district.toLowerCase());

  const commonKeywords = [
    'rumah', 'apartemen', 'kost', 'villa', 'ruko', 'tanah', 'gudang',
    'dijual', 'disewakan', 'sewa', 'jual',
    'strategis', 'murah', 'bagus', 'baru', 'cantik', 'indah',
    'fasilitas', 'dekat', 'pusat', 'kota', 'lokasi'
  ];

  if (text && typeof text === 'string') {
    const lowerText = text.toLowerCase();
    commonKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        keywords.add(keyword);
      }
    });
  }

  return Array.from(keywords).slice(0, 10);
}

// Format price helper
export function formatPrice(price: number | string): string {
  if (!price) return 'Harga belum ditentukan';
  const num = parseFloat(String(price));
  if (num >= 1000000000) {
    return `Rp ${(num / 1000000000).toFixed(1)}M`;
  } else if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}M`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

// Types for Vercel functions
export interface VercelRequest {
  method: string;
  headers: Headers;
  url: string;
  body?: any;
  query?: Record<string, string>;
}

export interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
  setHeader: (key: string, value: string) => void;
}

// Environment type
export interface EnvConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY: string;
  GA_SERVICE_ACCOUNT_KEY?: string;
  GA_PROPERTY_ID?: string;
  SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY?: string;
  SEARCH_CONSOLE_SITE_URL?: string;
  PAGESPEED_API_KEY?: string;
  CF_IMAGES_TOKEN?: string;
  CF_ACCOUNT_ID?: string;
}

// Helper to get environment variables (supports both VITE_ and non-VITE prefixes)
export function getEnvVar(key: string): string | undefined {
  // For Vercel serverless functions, use process.env
  // Try both with and without VITE_ prefix
  return process.env[key] || process.env[`VITE_${key}`] || process.env[key.replace('VITE_', '')];
}

// Get Supabase configuration
export function getSupabaseConfig() {
  const url = getEnvVar('SUPABASE_URL');
  const key = getEnvVar('SUPABASE_ANON_KEY');
  
  if (!url || !key) {
    console.error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables.');
  }
  
  return { url, key };
}
