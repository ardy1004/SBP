/**
 * GET /api/analytics
 * Analytics data untuk admin dashboard
 * 
 * Headers: Authorization: Bearer {token}
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);
    if (!admin) {
      return errorResponse("Unauthorized", 401, request);
    }

    // Aggregate queries
    const [totalProps, activeProps, soldProps, totalLeads, newLeads, contractsByStatus, propsByType, leadsBySource, recentActivities] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) as count FROM properties").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM properties WHERE is_sold = 0 AND status = 'active'").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM properties WHERE is_sold = 1").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM leads").first(),
      env.DB.prepare("SELECT COUNT(*) as count FROM leads WHERE status = 'new'").first(),
      env.DB.prepare("SELECT status, COUNT(*) as count FROM contracts GROUP BY status").all(),
      env.DB.prepare("SELECT property_type as name, COUNT(*) as count FROM properties GROUP BY property_type ORDER BY count DESC").all(),
      env.DB.prepare("SELECT source, COUNT(*) as leads FROM leads GROUP BY source ORDER BY leads DESC").all(),
      env.DB.prepare("SELECT action, detail, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 10").all(),
    ]);

    // Leads by status
    const leadsByStatusResult = await env.DB.prepare(
      "SELECT status, COUNT(*) as count FROM leads GROUP BY status"
    ).all();

    const leadsByStatus = {};
    for (const row of (leadsByStatusResult.results || [])) {
      leadsByStatus[row.status] = row.count;
    }

    return jsonResponse({
      success: true,
      data: {
        properties: {
          total: totalProps?.count || 0,
          active: activeProps?.count || 0,
          sold: soldProps?.count || 0,
          by_type: propsByType.results || [],
        },
        leads: {
          total: totalLeads?.count || 0,
          new_today: newLeads?.count || 0,
          by_status: leadsByStatus,
          by_source: leadsBySource.results || [],
        },
        contracts: {
          by_status: contractsByStatus.results || [],
        },
        recent_activities: recentActivities.results || [],
      },
    }, 200, request);

  } catch (error) {
    console.error("Analytics error:", error);
    return errorResponse("Gagal mengambil data analytics", 500, request);
  }
}
