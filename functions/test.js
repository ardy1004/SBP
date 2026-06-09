export async function onRequestGet(context) {
  return new Response(JSON.stringify({ ok: true, message: "Functions work!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
