// 公共工具函数

// 管理员邮箱
export const ADMIN_EMAIL = "njzj_2580@qq.com";

// 从 KV 获取 JSON 数据
export async function getJSON(env, key, defaultValue) {
  const data = await env.GAIBANG_KV.get(key);
  return data ? JSON.parse(data) : defaultValue;
}

// 保存 JSON 数据到 KV
export async function putJSON(env, key, value) {
  await env.GAIBANG_KV.put(key, JSON.stringify(value));
}

// 确保管理员账号存在（首次登录时自动创建）
export async function ensureAdmin(env) {
  try {
    const users = await getJSON(env, "userList", []);
    if (!users.some(u => u.email === ADMIN_EMAIL)) {
      users.push({
        email: ADMIN_EMAIL,
        password: "12345678",
        createTime: new Date().toLocaleString()
      });
      await putJSON(env, "userList", users);
    }
  } catch (err) {
    console.error("管理员初始化失败：", err);
  }
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

// 用 QQ 邮箱 SMTP 发送邮件（通过 Cloudflare Email Workers 或本地中转）
// 注意：Cloudflare Workers 无法直接 SMTP，需借助第三方服务
// 这里保留 EmailJS 作为发送通道，但发件人身份显示为丐帮管理员邮箱
export async function sendVerifyCodeEmail(to, code) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: "service_0j0n7sm",
      template_id: "template_otjp8aq",
      user_id: "stT8IBhAR8W_trFJ_",
      template_params: {
        email: to,
        passcode: code
      }
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("EmailJS 发送失败：", err);
    throw new Error("邮件发送失败");
  }
  return true;
}
