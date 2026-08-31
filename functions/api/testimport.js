import { TEST_CONST } from "../_utils.js";

export async function onRequest(context) {
  return new Response(JSON.stringify({ code: 200, data: TEST_CONST }), {
    headers: { "Content-Type": "application/json" }
  });
}
