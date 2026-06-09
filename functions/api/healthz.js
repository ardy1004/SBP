/**
 * GET /api/healthz
 * Health check endpoint
 */
import { jsonResponse, handleCors } from "./_utils/cors.js";

export async function onRequestGet(context) {
  const { request } = context;

  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  return jsonResponse({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Salam Bumi Property API",
    version: "2.0",
  }, 200, request);
}
