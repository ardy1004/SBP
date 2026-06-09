/**
 * /api/leads
 * POST - Create new lead (public - contact form)
 * GET  - List all leads (admin only)
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

// POST /api/leads - Submit form kontak (public)
export async function onRequestPost(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const body = await request.json();

    // Validasi field wajib
    if (!body.name || !body.whatsapp) {
      return errorResponse("Nama dan WhatsApp wajib diisi", 400, request);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert lead
    await env.DB.prepare(`
      INSERT INTO leads (
        id, name, whatsapp, email, origin, role,
        property_id, property_slug, property_interest,
        budget, payment_plan, message,
        source, status, priority, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.name,
      body.whatsapp,
      body.email || null,
      body.origin || null,
      body.role || "Calon Pembeli",
      body.property_id || null,
      body.property_slug || null,
      body.property_interest || null,
      body.budget || null,
      body.payment_plan || null,
      body.message || null,
      body.source || "Website Form",
      "new",
      "warm",
      "",
      now,
      now
    ).run();

    // Increment leads_count pada properti jika kolom tersedia
    if (body.property_id) {
      try {
        await env.DB.prepare(
          "UPDATE properties SET leads_count = COALESCE(leads_count, 0) + 1 WHERE id = ?"
        ).bind(body.property_id).run();
      } catch (leadCountError) {
        console.warn("[LEADS] Skip leads_count update:", leadCountError?.message || leadCountError);
      }
    }

    return jsonResponse({
      success: true,
      id,
      message: "Terima kasih! Kami akan segera menghubungi Anda.",
    }, 201, request);

  } catch (error) {
    console.error("Lead create error:", error);
    return errorResponse("Gagal mengirim data", 500, request);
  }
}

// GET /api/leads - List leads (admin only)
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

    // Filter params
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const source = url.searchParams.get("source");
    const search = url.searchParams.get("search");

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND l.status = ?";
      params.push(status);
    }
    if (priority) {
      whereClause += " AND l.priority = ?";
      params.push(priority);
    }
    if (source) {
      whereClause += " AND l.source = ?";
      params.push(source);
    }
    if (search) {
      whereClause += " AND (l.name LIKE ? OR l.whatsapp LIKE ? OR l.property_interest LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Hitung total
    const countResult = await env.DB.prepare(
      `SELECT COUNT(*) as total FROM leads l ${whereClause}`
    ).bind(...params).first();

    const total = countResult?.total || 0;

    // Fetch leads
    const leads = await env.DB.prepare(
      `SELECT l.* FROM leads l ${whereClause} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    return jsonResponse({
      success: true,
      data: leads.results || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }, 200, request);

  } catch (error) {
    console.error("Leads list error:", error);
    return errorResponse("Gagal mengambil data leads", 500, request);
  }
}
