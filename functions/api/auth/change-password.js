/**
 * POST /api/auth/change-password
 * Change admin password (admin only, requires current password verification)
 *
 * Format password: salt$<base64_salt>$<hex_hash>
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";
import { hashPassword, verifyPassword } from "../_utils/shared.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return errorResponse("Password lama dan baru wajib diisi", 400, request);
    }

    if (new_password.length < 8) {
      return errorResponse("Password baru minimal 8 karakter", 400, request);
    }

    // Verify current password
    const adminRecord = await env.DB.prepare(
      "SELECT password_hash FROM admins WHERE id = ?"
    ).bind(admin.id).first();

    if (!adminRecord || !(await verifyPassword(current_password, adminRecord.password_hash))) {
      return errorResponse("Password lama salah", 401, request);
    }

    // Hash new password
    const newHash = await hashPassword(new_password);

    // Update password
    await env.DB.prepare(
      "UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?"
    ).bind(newHash, new Date().toISOString(), admin.id).run();

    // Log activity
    await env.DB.prepare(
      "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(), admin.id, "Change Password", "auth", admin.id,
      "Admin mengubah password",
      request.headers.get("CF-Connecting-IP") || "unknown"
    ).run();

    return jsonResponse({
      success: true,
      message: "Password berhasil diubah",
    }, 200, request);
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse("Gagal mengubah password", 500, request);
  }
}
