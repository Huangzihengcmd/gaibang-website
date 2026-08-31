import { getJSON, putJSON, jsonResponse, handleOptions, parseBody } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { email, password, code } = body;

  if (!email || !password || !code) {
    return jsonResponse({ code: 400, msg: "邮箱、密码、验证码不能为空" });
  }

  // 校验验证码
  const recordStr = await env.GAIBANG_KV.get(`verifyCode:${email}`);
  if (!recordStr) return jsonResponse({ code: 400, msg: "请先获取验证码" });
  const record = JSON.parse(recordStr);
  if (Date.now() > record.expireAt) {
    await env.GAIBANG_KV.delete(`verifyCode:${email}`);
    return jsonResponse({ code: 400, msg: "验证码已过期，请重新获取" });
  }
  if (record.code !== code) return jsonResponse({ code: 400, msg: "验证码错误" });

  // 检查邮箱是否已注册
  const userList = await getJSON(env, "userList", []);
  const existUser = userList.find(item => item.email === email);
  if (existUser) return jsonResponse({ code: 400, msg: "该邮箱已注册" });

  userList.push({ email, password, createTime: new Date().toLocaleString() });
  await putJSON(env, "userList", userList);

  // 注册成功后删除验证码
  await env.GAIBANG_KV.delete(`verifyCode:${email}`);

  return jsonResponse({ code: 200, msg: "注册成功，请登录" });
}
