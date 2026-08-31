import { jsonResponse, handleOptions, parseBody, sendEmail } from "../_utils.js";

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

  // 发送验证码邮件
  const html = `
    <div style="font-family:微软雅黑,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#111;border:2px solid #ffd700;border-radius:10px;color:#fff;">
      <h2 style="color:#ffd700;text-align:center;margin:0 0 20px;">丐帮注册验证码</h2>
      <p style="font-size:16px;line-height:1.8;">大侠您好，</p>
      <p style="font-size:16px;line-height:1.8;">您正在注册丐帮账号，验证码如下：</p>
      <div style="text-align:center;margin:30px 0;">
        <span style="display:inline-block;font-size:36px;font-weight:bold;letter-spacing:8px;color:#ffd700;background:#222;padding:15px 40px;border-radius:8px;border:1px solid #ffd700;">${code}</span>
      </div>
      <p style="font-size:14px;color:#999;line-height:1.6;">验证码有效期为10分钟，请勿泄露给他人。<br>如非本人操作，请忽略此邮件。</p>
      <p style="text-align:center;color:#666;font-size:12px;margin-top:30px;">© 2026 丐帮 | 版权所有</p>
    </div>
  `;

  try {
    await sendEmail(env, email, "【丐帮】注册验证码", html);
    return jsonResponse({ code: 200, msg: "验证码已发送，请查收邮箱" });
  } catch (err) {
    console.error("验证码发送失败：", err);
    return jsonResponse({ code: 500, msg: "验证码发送失败，请稍后重试" });
  }
}
