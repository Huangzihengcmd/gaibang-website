export const ADMIN_EMAIL = "a13128283441@163.com";

export async function getJSON(env, key, defaultValue) {
  const data = await env.GAIBANG_KV.get(key);
  return data ? JSON.parse(data) : defaultValue;
}

export async function putJSON(env, key, value) {
  await env.GAIBANG_KV.put(key, JSON.stringify(value));
}

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

export async function parseBody(request) {
  try {
    return await request.json();
  } catch (e) {
    return {};
  }
}

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
    const errText = await res.text();
    console.error("EmailJS send failed:", errText);
    throw new Error("Email send failed");
  }
  return true;
}
