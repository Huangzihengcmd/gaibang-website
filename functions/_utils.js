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
