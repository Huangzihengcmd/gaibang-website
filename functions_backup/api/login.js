import { getJSON, jsonResponse, handleOptions, parseBody } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { email, password } = body;

  const userList = await getJSON(env, "userList", []);
  const targetUser = userList.find(item => item.email === email && item.password === password);
  if (!targetUser) return jsonResponse({ code: 400, msg: "邮箱或密码错误" });

  return jsonResponse({ code: 200, msg: "登录成功", data: { email } });
}
