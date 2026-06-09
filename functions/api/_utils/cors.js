const ALLOWED_ORIGINS = [
   "https://salambumi.xyz",
   "https://www.salambumi.xyz",
   "https://salambumi-property.pages.dev",
   "http://localhost:5173",
   "http://localhost:5174",
   "http://localhost:3000",
   "http://localhost:8788",
 ];

// Security headers — HIGH PRIORITY #3 FIX
// Ditambahkan ke semua API response untuk mitigasi XSS, clickjacking, sniffing.
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // CSP hanya untuk API responses (bukan HTML), jadi boleh strict
  "Content-Security-Policy": "default-src 'none'",
};

export function getCorsHeaders(request) {
   const origin = request.headers.get("Origin") || "";

   // Izinkan:
   // 1. Origin yang terdaftar di ALLOWED_ORIGINS
   // 2. Localhost (development)
   // 3. Semua *.salambumi-property.pages.dev (Cloudflare Pages deployment URLs)
   const isAllowed =
     ALLOWED_ORIGINS.includes(origin) ||
     origin.startsWith("http://localhost:") ||
     origin.endsWith(".salambumi-property.pages.dev");

   if (!isAllowed) {
      return {};
   }

   return {
     "Access-Control-Allow-Origin": origin,
     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
     "Access-Control-Allow-Headers": "Content-Type, Authorization",
     "Access-Control-Allow-Credentials": "true",
     "Access-Control-Max-Age": "86400",
   };
}

export function handleCors(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }
  return null;
}

export function jsonResponse(data, status, request, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...SECURITY_HEADERS,
      ...getCorsHeaders(request),
      ...extraHeaders,
    },
  });
}

export function errorResponse(message, status, request) {
  return jsonResponse({ success: false, error: message }, status, request);
}
