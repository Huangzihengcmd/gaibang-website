import { getJSON, putJSON, jsonResponse, handleOptions, ADMIN_EMAIL } from "../../../../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "DELETE") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env, params } = context;
  const url = new URL(request.url);
  const adminEmail = url.searchParams.get("adminEmail");

  if (adminEmail !== ADMIN_EMAIL) return jsonResponse({ code: 403, msg: "无管理员权限" });

  const id = parseInt(params.id);
  let newsList = await getJSON(env, "newsList", []);
  newsList = newsList.filter(item => item.id !== id);
  await putJSON(env, "newsList", newsList);

  return jsonResponse({ code: 200, msg: "新闻已删除" });
}
