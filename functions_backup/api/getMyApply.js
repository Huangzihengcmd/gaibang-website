import { getJSON, jsonResponse, handleOptions } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "GET") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  const applyList = await getJSON(env, "applyList", []);
  const myApply = applyList.find(item => item.email === email);
  return jsonResponse({ code: 200, data: myApply || null });
}
