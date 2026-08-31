export async function onRequest(context) {
  return new Response(JSON.stringify({ code: 200, msg: "hello" }), {
    headers: { "Content-Type": "application/json" }
  });
}
