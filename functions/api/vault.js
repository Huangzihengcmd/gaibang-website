import { jsonResponse } from "../_utils.js";
export async function onRequest() {
  return jsonResponse({ code: 200, msg: "vault alive" });
}
