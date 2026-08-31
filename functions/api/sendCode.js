import { jsonResponse, handleOptions, parseBody, sendVerifyCodeEmail } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { email } = body;

  if (!email) return jsonResponse({ code: 400, msg: "邮箱不能为空" });

  // 生成6位数字验证码
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expireAt = Date.now() + 10 * 60 * 1000;

  // 存到 KV，10分钟后自动过期
  await env.GAIBANG_KV.put(`verifyCode:${email}`, JSON.stringify({ code, expireAt }), {
    expirationTtl: 600
  });

  // 用 EmailJS 发送验证码邮件
  try {
    await sendVerifyCodeEmail(email, code);
    return jsonResponse({ code: 200, msg: "验证码已发送，请查收邮箱" });
  } catch (err) {
    console.error("验证码发送失败：", err);
    return jsonResponse({ code: 500, msg: "验证码发送失败，请稍后重试" });
  }
}
