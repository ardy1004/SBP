/**
 * PUT /api/leads/[id]
 * Update lead status, priority, notes (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestPut(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const { id } = params;
    const body = await request.json();

    // Cek lead exists
    const existing = await env.DB.prepare("SELECT id FROM leads WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Lead tidak ditemukan", 404, request);
    }

    // Build dynamic update
    const allowedFields = ["status", "priority", "notes", "last_contact", "next_followup"];
    const setClauses = [];
    const values = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (setClauses.length === 0) {
      return errorResponse("Tidak ada field yang diupdate", 400, request);
    }

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await env.DB.prepare(
      `UPDATE leads SET ${setClauses.join(", ")} WHERE id = ?`
    ).bind(...values).run();

    return jsonResponse({ success: true, message: "Lead berhasil diupdate" }, 200, request);

  } catch (error) {
    console.error("Lead update error:", error);
    return errorResponse("Gagal mengupdate lead", 500, request);
  }
}
