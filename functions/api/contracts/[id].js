/**
 * /api/contracts/[id]
 * GET   - Get contract detail (admin only)
 * PUT   - Update contract (admin only)
 * DELETE- Delete contract (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// GET /api/contracts/:id
export async function onRequestGet(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const { id } = params;

    const contract = await env.DB.prepare(
      "SELECT * FROM contracts WHERE id = ?"
    ).bind(id).first();

    if (!contract) {
      return errorResponse("Kontrak tidak ditemukan", 404, request);
    }

    // Filter sensitive data
    const filtered = {
      id: contract.id,
      contract_number: contract.contract_number,
      listing_code: contract.listing_code,
      property_id: contract.property_id,
      property_title: contract.property_title,
      owner_name: contract.owner_name,
      owner_ktp: contract.owner_ktp,
      owner_whatsapp: contract.owner_whatsapp,
      contract_type: contract.contract_type,
      contract_duration: contract.contract_duration,
      fee_percent: contract.fee_percent,
      signed_date: contract.signed_date,
      expiry_date: contract.expiry_date,
      status: contract.status,
      owner_signature: contract.owner_signature,
      agent_signature: contract.agent_signature,
      notes: contract.notes,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
    };

    return jsonResponse({ success: true, data: filtered }, 200, request);
  } catch (error) {
    console.error("Contract detail error:", error);
    return errorResponse("Gagal mengambil detail kontrak", 500, request);
  }
}

// PUT /api/contracts/:id
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

    // Cek contract exists
    const existing = await env.DB.prepare("SELECT id FROM contracts WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Kontrak tidak ditemukan", 404, request);
    }

    const allowedFields = [
      "owner_name", "owner_ktp", "owner_whatsapp", "property_id", "property_title",
      "listing_code", "contract_type", "contract_duration", "fee_percent",
      "signed_date", "expiry_date", "status", "notes",
      "owner_signature", "agent_signature",
    ];

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
      `UPDATE contracts SET ${setClauses.join(", ")} WHERE id = ?`
    ).bind(...values).run();

    // Log activity
    await env.DB.prepare(
      "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(), admin.id, "Update", "contract", id,
      `Kontrak ${body.contract_number || id} diupdate`,
      request.headers.get("CF-Connecting-IP") || "unknown"
    ).run();

    return jsonResponse({ success: true, message: "Kontrak berhasil diupdate" }, 200, request);
  } catch (error) {
    console.error("Contract update error:", error);
    return errorResponse("Gagal mengupdate kontrak", 500, request);
  }
}

// DELETE /api/contracts/:id
export async function onRequestDelete(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const { id } = params;

    const existing = await env.DB.prepare("SELECT id, contract_number FROM contracts WHERE id = ?").bind(id).first();
    if (!existing) {
      return errorResponse("Kontrak tidak ditemukan", 404, request);
    }

    await env.DB.prepare("DELETE FROM contracts WHERE id = ?").bind(id).run();

    // Log activity
    await env.DB.prepare(
      "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(), admin.id, "Delete", "contract", id,
      `Kontrak ${existing.contract_number} dihapus`,
      request.headers.get("CF-Connecting-IP") || "unknown"
    ).run();

    return jsonResponse({ success: true, message: "Kontrak berhasil dihapus" }, 200, request);
  } catch (error) {
    console.error("Contract delete error:", error);
    return errorResponse("Gagal menghapus kontrak", 500, request);
  }
}
