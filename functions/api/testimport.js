import { jsonResponse, parseBody } from "../_utils.js";

export async function onRequest(context) {
  const { request } = context;
  const body = await parseBody(request);
  return jsonResponse({ code: 200, data: body });
}
