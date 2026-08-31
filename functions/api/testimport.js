import { jsonResponse, ADMIN_EMAIL } from "../_utils.js";

export async function onRequest(context) {
  return jsonResponse({ code: 200, data: ADMIN_EMAIL });
}
