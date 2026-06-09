/**
 * /api/submissions
 * GET - List form submissions (admin only)
 *
 * Submissions adalah leads dengan role "Penjual" / "Pemilik Properti"
 * yang mengirimkan form "Titip Jual Properti".
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// GET /api/submissions
export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;
    const status = url.searchParams.get("status");

    // Submissions = leads dengan role Penjual atau message mengandung keyword titip jual
    let whereClause = "WHERE (l.role IN ('Penjual', 'Pemilik Properti') OR l.message LIKE '%titip jual%' OR l.message LIKE '%konsultasi%')";
    const params = [];

    if (status) {
      whereClause += " AND l.status = ?";
      params.push(status);
    }

    // Hitung total
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM leads l ${whereClause}`
    ).bind(...params).first();
    const total = countResult?.total || 0;

    // Fetch submissions
    const submissions = await env.DB.prepare(
      `SELECT l.* FROM leads l ${whereClause} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    // Format response
    const formatted = (submissions.results || []).map(s => ({
      id: s.id,
      submitted_at: s.created_at,
      owner_name: s.name,
      whatsapp: s.whatsapp,
      property_type: s.property_interest || "",
      location: s.origin || "",
      status: s.status,
      notes: s.notes,
      message: s.message,
      budget: s.budget,
      role: s.role,
    }));

    return jsonResponse({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }, 200, request);
  } catch (error) {
    console.error("Submissions list error:", error);
    return errorResponse("Gagal mengambil data submission", 500, request);
  }
}

// PUT /api/submissions/:id - update submission status (reuse leads/[id].js logic)
// Handled by leads/[id].js
