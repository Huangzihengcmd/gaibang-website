import { getJSON, putJSON, jsonResponse, handleOptions, parseBody, ADMIN_EMAIL } from "../../../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { adminEmail, title, content } = body;

  if (adminEmail !== ADMIN_EMAIL) return jsonResponse({ code: 403, msg: "无管理员权限" });
  if (!title || !content) return jsonResponse({ code: 400, msg: "标题和内容不能为空" });

  const newsList = await getJSON(env, "newsList", []);
  newsList.unshift({
    id: Date.now(),
    title,
    content,
    time: new Date().toLocaleString()
  });
  await putJSON(env, "newsList", newsList);

  return jsonResponse({ code: 200, msg: "新闻发布成功" });
}
