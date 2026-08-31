import { getJSON, jsonResponse, handleOptions, ADMIN_EMAIL } from "../../../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "GET") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const url = new URL(request.url);
  const adminEmail = url.searchParams.get("adminEmail");

  if (adminEmail !== ADMIN_EMAIL) return jsonResponse({ code: 403, msg: "无管理员权限" });

  let applyList = await getJSON(env, "applyList", []);
  applyList = applyList.filter(item => item.email !== ADMIN_EMAIL);
  return jsonResponse({ code: 200, data: applyList });
}
