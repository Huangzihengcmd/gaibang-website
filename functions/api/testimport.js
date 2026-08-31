import { jsonResponse, sendVerifyCodeEmail } from "../_utils.js";

export async function onRequest(context) {
  return jsonResponse({ code: 200, data: "sendVerifyCodeEmail imported" });
}
