/**
 * POST /api/import/rollback/:import_id
 * Rollback an import (delete all imported properties)
 * 
 * Headers: Authorization: Bearer {token}
 * Response: { success, message, rolled_back_count }
 */
import { jsonResponse, errorResponse, handleCors } from "../../_utils/cors.js";
import { requireAuth } from "../../_utils/jwt.js";

export async function onRequestPost(context) {
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

     // Check if rollback is available
     const now = Math.floor(Date.now() / 1000);
     if (!importLog.rollback_available_until || importLog.rollback_available_until < now) {
       return errorResponse("Rollback tidak tersedia (sudah lebih dari 24 jam)", 400, request);
     }

     // Check if already rolled back
     if (importLog.status === "rolled_back") {
       return errorResponse("Import sudah di-rollback sebelumnya", 400, request);
     }

     // Parse imported_ids
     let importedIds = [];
     try {
       importedIds = JSON.parse(importLog.imported_ids || "[]");
     } catch (e) {
       importedIds = [];
     }

     if (importedIds.length === 0) {
       return errorResponse("Tidak ada data yang perlu di-rollback", 400, request);
     }

     // Delete properties and their images
     let rolledBackCount = 0;

     for (const propertyId of importedIds) {
       try {
         // Delete images first
         await env.DB.prepare(
           "DELETE FROM property_images WHERE property_id = ?"
         ).bind(propertyId).run();

         // Delete property
         await env.DB.prepare(
           "DELETE FROM properties WHERE id = ?"
         ).bind(propertyId).run();

         rolledBackCount++;
       } catch (err) {
         console.error(`Failed to delete property ${propertyId}:`, err);
       }
     }

     // Update import_logs status
     await env.DB.prepare(
       "UPDATE import_logs SET status = 'rolled_back' WHERE id = ?"
     ).bind(importId).run();

     // Log activity
     if (admin) {
       await env.DB.prepare(
         "INSERT INTO activity_logs (id, admin_id, action, entity_type, entity_id, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)"
       ).bind(
         crypto.randomUUID(), admin.id, "Rollback Import", "bulk_import", importId,
         `Rollback import ${importLog.filename}: ${rolledBackCount} properti dihapus`,
         request.headers.get("CF-Connecting-IP") || "unknown"
       ).run();
     }

     return jsonResponse({
       success: true,
       message: "Import berhasil di-rollback",
       rolled_back_count: rolledBackCount
     }, 200, request);

   } catch (error) {
     console.error("Rollback error:", error);
     return errorResponse("Gagal melakukan rollback", 500, request);
   }
}
