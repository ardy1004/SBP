/**
 * /api/admin/settings
 * GET  - Get all settings (admin only)
 * PUT  - Update settings (admin only)
 *
 * Settings disimpan di tabel admin_settings (key-value).
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// GET /api/admin/settings
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const rows = await env.DB.prepare("SELECT key, value FROM admin_settings").all();

    const settings = {};
    for (const row of (rows.results || [])) {
      settings[row.key] = row.value;
    }

    return jsonResponse({ success: true, data: settings }, 200, request);
  } catch (error) {
    console.error("Settings get error:", error);
    return errorResponse("Gagal mengambil pengaturan", 500, request);
  }
}

// PUT /api/admin/settings
export async function onRequestPut(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(body)) {
      await env.DB.prepare(`
        INSERT INTO admin_settings (key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = excluded.updated_at
      `).bind(key, String(value), now).run();
    }

    // Log activity
    await env.DB.prepare(
      "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(), admin.id, "Update", "settings", "admin",
      `Pengaturan admin diupdate (${Object.keys(body).length} field)`,
      request.headers.get("CF-Connecting-IP") || "unknown"
    ).run();

    return jsonResponse({
      success: true,
      message: "Pengaturan berhasil disimpan",
    }, 200, request);
  } catch (error) {
    console.error("Settings update error:", error);
    return errorResponse("Gagal menyimpan pengaturan", 500, request);
  }
}
