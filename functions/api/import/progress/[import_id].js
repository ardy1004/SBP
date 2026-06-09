/**
 * GET /api/import/progress/:import_id
 * Get import progress status
 * 
 * Headers: Authorization: Bearer {token}
 * Response: { success, import_id, status, total_rows, processed_rows, success_count, failed_count, progress_percentage }
 */
import { jsonResponse, errorResponse, handleCors } from "../../_utils/cors.js";
import { requireAuth } from "../../_utils/jwt.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return errorResponse('Unauthorized', 401, request);
   }

   try {
     const importId = params.import_id;

     if (!importId) {
       return errorResponse("import_id diperlukan", 400, request);
     }

     // Query import_logs
     const importLog = await env.DB.prepare(
       "SELECT * FROM import_logs WHERE id = ?"
     ).bind(importId).first();

     if (!importLog) {
       return errorResponse("Import tidak ditemukan", 404, request);
     }

     // Calculate progress percentage
     const processedRows = (importLog.success_count || 0) + (importLog.failed_count || 0);
     const progressPercentage = importLog.total_rows > 0 
       ? Math.round((processedRows / importLog.total_rows) * 100)
       : 0;

     return jsonResponse({
       success: true,
       import_id: importLog.id,
       status: importLog.status,
       filename: importLog.filename,
       total_rows: importLog.total_rows,
       processed_rows: processedRows,
       success_count: importLog.success_count || 0,
       failed_count: importLog.failed_count || 0,
       progress_percentage: progressPercentage,
       rollback_available_until: importLog.rollback_available_until,
       created_at: importLog.created_at
     }, 200, request);

   } catch (error) {
     console.error("Progress check error:", error);
     return errorResponse("Gagal mengecek progress import", 500, request);
   }
}
