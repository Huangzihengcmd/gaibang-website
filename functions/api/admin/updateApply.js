import { getJSON, putJSON, jsonResponse, handleOptions, parseBody, ADMIN_EMAIL } from "../../../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { adminEmail, targetEmail, newStatus } = body;

  if (adminEmail !== ADMIN_EMAIL) return jsonResponse({ code: 403, msg: "无管理员权限" });

  let applyList = await getJSON(env, "applyList", []);
  const target = applyList.find(item => item.email === targetEmail);
  if (!target) return jsonResponse({ code: 404, msg: "未找到该申请记录" });

  target.status = newStatus;
  await putJSON(env, "applyList", applyList);
  return jsonResponse({ code: 200, msg: "审核状态已更新" });
}
