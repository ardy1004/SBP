export async function onRequestGet(context) {
  const { env } = context;
  try {
    // Test if DB binding exists and can execute a simple query
    const result = await env.DB.prepare("SELECT 1 as ok").first();
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
