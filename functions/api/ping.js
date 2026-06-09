export async function onRequestGet() {
  return new Response(JSON.stringify({ success: true, message: "OK" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
