function getJwtSecret(env) {
  if (!env.JWT_SECRET) {
    // JWT_SECRET wajib di semua environment.
    // Ini adalah project Cloudflare PAGES — gunakan perintah Pages:
    //
    //   Production:
    //     wrangler pages secret put JWT_SECRET --project-name salambumi-property
    //
    //   Development lokal — buat file .dev.vars di root project:
    //     echo 'JWT_SECRET="dev-secret-min-32-chars-ganti-ini"' > .dev.vars
    //
    throw new Error(
      "[JWT] JWT_SECRET tidak ditemukan. " +
      "Production: jalankan `wrangler pages secret put JWT_SECRET --project-name salambumi-property`. " +
      "Development: buat file .dev.vars dengan isi JWT_SECRET=..."
    );
  }

  const secret = env.JWT_SECRET;
  if (secret.length < 32) {
    throw new Error("[JWT] JWT_SECRET terlalu pendek. Minimal 32 karakter.");
  }

  return new TextEncoder().encode(secret);
}

async function importKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(str) {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function encodeJsonBase64Url(data) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(data)));
}

function decodeJsonBase64Url(str) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(str)));
}

export async function generateToken(payload, expiresIn = 86400, env = {}) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresIn };
  const headerB64 = encodeJsonBase64Url(header);
  const payloadB64 = encodeJsonBase64Url(fullPayload);
  const data = `${headerB64}.${payloadB64}`;
  const key = await importKey(getJwtSecret(env));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const signatureB64 = bytesToBase64Url(new Uint8Array(signature));

  return `${data}.${signatureB64}`;
}

export async function verifyToken(token, env = {}) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const key = await importKey(getJwtSecret(env));
    const signatureBytes = base64UrlToBytes(signatureB64);
    const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(data));

    if (!isValid) return null;

    const header = decodeJsonBase64Url(headerB64);
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const payload = decodeJsonBase64Url(payloadB64);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function extractToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function requireAuth(request, env) {
   const token = extractToken(request);
   if (!token) return null;

   const payload = await verifyToken(token, env);
   if (!payload || !payload.email) return null;

   const admin = await env.DB.prepare(
     "SELECT id, email, name, role, photo_url, whatsapp, is_active FROM admins WHERE email = ?"
   ).bind(payload.email).first();

   if (!admin || !admin.is_active) return null;
   return admin;
 }
