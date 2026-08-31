// 公共工具函数

// 管理员邮箱
export const ADMIN_EMAIL = "a13128283441@163.com";

// 从 KV 获取 JSON 数据
export async function getJSON(env, key, defaultValue) {
  const data = await env.GAIBANG_KV.get(key);
  return data ? JSON.parse(data) : defaultValue;
}

// 保存 JSON 数据到 KV
export async function putJSON(env, key, value) {
  await env.GAIBANG_KV.put(key, JSON.stringify(value));
}

// 返回 JSON 响应
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

// 处理 OPTIONS 预检请求
export function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

// 解析请求体
export async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

// 用 Resend 发送邮件
export async function sendEmail(env, to, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "丐帮 <onboarding@resend.dev>",
      to: to,
      subject: subject,
      html: html
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Resend 发送失败：", err);
    throw new Error("邮件发送失败");
  }
  return true;
}
