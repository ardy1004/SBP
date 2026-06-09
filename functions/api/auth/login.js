/**
 * POST /api/auth/login
 * Admin authentication endpoint
 *
 * Rate limiting: persistent di D1 (login_rate_limits table).
 * In-memory Map() TIDAK digunakan — tidak efektif di Cloudflare Workers
 * karena setiap request bisa jatuh ke worker instance berbeda (stateless).
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { generateToken } from "../_utils/jwt.js";
import { verifyPassword } from "../_utils/shared.js";

// Konfigurasi rate limiting
const WINDOW_MS = 15 * 60; // 15 menit dalam detik (D1 pakai Unix timestamp)
const MAX_ATTEMPTS = 5;    // Maks percobaan gagal sebelum lockout
const LOCKOUT_DURATION = 15 * 60; // Durasi lockout dalam detik

/**
 * Cek dan update rate limit untuk IP dari D1.
 * Returns: { blocked: boolean, attemptsLeft: number }
 */
async function checkRateLimit(db, ip) {
  const now = Math.floor(Date.now() / 1000);

  // Ambil data rate limit untuk IP ini
  const row = await db.prepare(
    "SELECT attempts, first_attempt_at, locked_until FROM login_rate_limits WHERE ip = ?"
  ).bind(ip).first();

  // Belum ada record → IP baru, izinkan
  if (!row) {
    return { blocked: false, attemptsLeft: MAX_ATTEMPTS };
  }

  // Cek apakah sedang dalam masa lockout aktif
  if (row.locked_until > now) {
    const secondsLeft = row.locked_until - now;
    const minsLeft = Math.ceil(secondsLeft / 60);
    return { blocked: true, minsLeft };
  }

  // Cek apakah window sudah lewat → reset otomatis
  if (now - row.first_attempt_at > WINDOW_MS) {
    // Window sudah habis, hapus record lama
    await db.prepare("DELETE FROM login_rate_limits WHERE ip = ?").bind(ip).run();
    return { blocked: false, attemptsLeft: MAX_ATTEMPTS };
  }

  // Masih dalam window, belum di-lock
  const attemptsLeft = MAX_ATTEMPTS - row.attempts;
  return { blocked: false, attemptsLeft: Math.max(0, attemptsLeft) };
}

/**
 * Catat percobaan login gagal untuk IP ini.
 * Jika sudah >= MAX_ATTEMPTS, set locked_until.
 */
async function recordFailedAttempt(db, ip) {
  const now = Math.floor(Date.now() / 1000);

  const row = await db.prepare(
    "SELECT attempts, first_attempt_at FROM login_rate_limits WHERE ip = ?"
  ).bind(ip).first();

  if (!row || (now - row.first_attempt_at) > WINDOW_MS) {
    // Record baru atau window sudah lewat → mulai window baru
    await db.prepare(`
      INSERT INTO login_rate_limits (ip, attempts, first_attempt_at, locked_until, updated_at)
      VALUES (?, 1, ?, 0, ?)
      ON CONFLICT(ip) DO UPDATE SET
        attempts = 1,
        first_attempt_at = excluded.first_attempt_at,
        locked_until = 0,
        updated_at = excluded.updated_at
    `).bind(ip, now, now).run();
    return;
  }

  const newAttempts = row.attempts + 1;
  const lockedUntil = newAttempts >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION : 0;

  await db.prepare(`
    UPDATE login_rate_limits
    SET attempts = ?, locked_until = ?, updated_at = ?
    WHERE ip = ?
  `).bind(newAttempts, lockedUntil, now, ip).run();
}

/**
 * Reset rate limit untuk IP setelah login berhasil.
 */
async function clearRateLimit(db, ip) {
  await db.prepare("DELETE FROM login_rate_limits WHERE ip = ?").bind(ip).run();
}

/**
 * Cleanup entri rate limit yang sudah kadaluarsa (best effort, jalankan setiap request).
 * Hapus record yang window-nya sudah lewat DAN tidak dalam masa lockout aktif.
 */
async function cleanupExpiredRateLimits(db) {
  const now = Math.floor(Date.now() / 1000);
  try {
    await db.prepare(`
      DELETE FROM login_rate_limits
      WHERE locked_until < ? AND first_attempt_at < ?
    `).bind(now, now - WINDOW_MS).run();
  } catch {
    // Best effort — jangan gagalkan request utama
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  // Ambil IP — CF-Connecting-IP diisi Cloudflare secara otomatis
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";

  // Cleanup expired records (best effort, tidak block request)
  cleanupExpiredRateLimits(env.DB).catch(() => {});

  try {
    // --- Cek rate limit SEBELUM baca body/DB admin ---
    let rl;
    try {
      rl = await checkRateLimit(env.DB, ip);
    } catch (rlError) {
      // Tabel login_rate_limits mungkin belum ada — skip rate limiting, lanjut login
      console.warn("[LOGIN] Rate limit check gagal (tabel belum ada?), skip:", rlError?.message || rlError);
      rl = { blocked: false, attemptsLeft: MAX_ATTEMPTS };
    }

    if (rl.blocked) {
      return errorResponse(
        `Terlalu banyak percobaan login. Coba lagi dalam ${rl.minsLeft} menit.`,
        429,
        request
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email dan password wajib diisi", 400, request);
    }

    // Cari admin di database
    const admin = await env.DB.prepare(
      "SELECT id, email, name, password_hash, role, photo_url, whatsapp, is_active FROM admins WHERE email = ?"
    ).bind(email.toLowerCase().trim()).first();

    if (!admin) {
      // Catat attempt (best effort — jangan crash jika tabel rate limit belum ada)
      try { await recordFailedAttempt(env.DB, ip); } catch {}
      return errorResponse("Email atau password salah", 401, request);
    }

    if (!admin.is_active) {
      return errorResponse("Akun tidak aktif", 403, request);
    }

    // Verifikasi password
    const passwordValid = await verifyPassword(password, admin.password_hash);
    if (!passwordValid) {
      try { await recordFailedAttempt(env.DB, ip); } catch {}
      return errorResponse("Email atau password salah", 401, request);
    }

    // Login berhasil → hapus rate limit untuk IP ini (best effort)
    try { await clearRateLimit(env.DB, ip); } catch {}

    // Generate JWT token (24 jam)
    const token = await generateToken(
      { sub: admin.id, email: admin.email, name: admin.name, role: admin.role },
      86400,
      env
    );

    // Log activity (best effort)
    try {
      await env.DB.prepare(
        "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(crypto.randomUUID(), admin.id, "Login", "auth", admin.id, "Admin login: " + admin.email, ip).run();
    } catch {}

    return jsonResponse({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        photo: admin.photo_url,
        whatsapp: admin.whatsapp,
      },
    }, 200, request);

  } catch (error) {
    console.error("Login error:", error?.message || error);
    return errorResponse("Terjadi kesalahan server", 500, request);
  }
}


