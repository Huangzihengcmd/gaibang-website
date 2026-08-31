import { putJSON, jsonResponse, handleOptions, parseBody, ADMIN_EMAIL } from "../../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { adminEmail, data } = body;

  if (adminEmail !== ADMIN_EMAIL) return jsonResponse({ code: 403, msg: "无管理员权限" });

  await putJSON(env, "boxData", data || []);
  return jsonResponse({ code: 200, msg: "百宝箱已保存" });
}
