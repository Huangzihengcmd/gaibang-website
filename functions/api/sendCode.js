import { jsonResponse, handleOptions, parseBody } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { email, code } = body;

  if (!email) return jsonResponse({ code: 400, msg: "邮箱不能为空" });
  if (!code) return jsonResponse({ code: 400, msg: "验证码不能为空" });

  const expireAt = Date.now() + 10 * 60 * 1000;

  // 存到 KV，10分钟后自动过期
  await env.GAIBANG_KV.put(`verifyCode:${email}`, JSON.stringify({ code, expireAt }), {
    expirationTtl: 600
  });

  return jsonResponse({ code: 200, msg: "验证码已存储" });
}
