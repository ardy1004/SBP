/**
 * GET /api/import/error-report/:import_id
 * Download error report CSV
 * 
 * Headers: Authorization: Bearer {token}
 * Response: CSV file with failed rows and error messages
 */
import { handleCors } from "../../_utils/cors.js";
import { requireAuth } from "../../_utils/jwt.js";

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

   // Authenticate request (admin only)
   const admin = await requireAuth(request, env);
   if (!admin) {
     return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
       status: 401,
       headers: { "Content-Type": "application/json" }
     });
   }

   try {
     const importId = params.import_id;

     if (!importId) {
       return new Response(JSON.stringify({ success: false, error: "import_id diperlukan" }), {
         status: 400,
         headers: { "Content-Type": "application/json" }
       });
     }

     // Query import_logs
     const importLog = await env.DB.prepare(
       "SELECT * FROM import_logs WHERE id = ?"
     ).bind(importId).first();

     if (!importLog) {
       return new Response(JSON.stringify({ success: false, error: "Import tidak ditemukan" }), {
         status: 404,
         headers: { "Content-Type": "application/json" }
       });
     }

     // Parse error_log
     let errors = [];
     try {
       errors = JSON.parse(importLog.error_log || "[]");
     } catch (e) {
       errors = [];
     }

     if (errors.length === 0) {
       return new Response(JSON.stringify({ success: false, error: "Tidak ada error untuk di-export" }), {
         status: 400,
         headers: { "Content-Type": "application/json" }
       });
     }

     // Generate CSV
     const BOM = "\uFEFF";
     const headers = ["row", "field", "value", "error"];
     const headerRow = headers.join(",");
     
     const dataRows = errors.map(err => {
       const row = [
         err.row || "",
         err.field || "",
         err.value || "",
         err.error || ""
       ];
       // Escape values
       return row.map(val => {
         const str = String(val);
         if (str.includes(",") || str.includes('"') || str.includes("\n")) {
           return `"${str.replace(/"/g, '""')}"`;
         }
         return str;
       }).join(",");
     });

     const csvContent = BOM + headerRow + "\n" + dataRows.join("\n");

     // Return CSV file
     return new Response(csvContent, {
       status: 200,
       headers: {
         "Content-Type": "text/csv; charset=utf-8",
         "Content-Disposition": `attachment; filename="error_report_${importId}.csv"`,
         "Cache-Control": "no-cache"
       }
     });

   } catch (error) {
     console.error("Error report download error:", error);
     return new Response(JSON.stringify({ success: false, error: "Gagal download error report" }), {
       status: 500,
       headers: { "Content-Type": "application/json" }
     });
   }
}
