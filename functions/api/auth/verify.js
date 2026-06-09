/**
 * GET /api/auth/verify
 * Verify JWT token dan return admin info
 * 
 * Headers: Authorization: Bearer {token}
 * Response: { valid, admin }
 */
import { jsonResponse, errorResponse, handleCors } from "../_utils/cors.js";
import { requireAuth } from "../_utils/jwt.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const admin = await requireAuth(request, env);

    if (!admin) {
      return jsonResponse({ valid: false, error: "Token tidak valid atau sudah kadaluarsa" }, 401, request);
    }

    return jsonResponse({
      valid: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    }, 200, request);

  } catch (error) {
    console.error("Verify error:", error);
    return errorResponse("Terjadi kesalahan server", 500, request);
  }
}
