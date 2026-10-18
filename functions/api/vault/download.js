// 下载文件（返回 base64，前端转成 Blob 触发保存）
import { jsonResponse, handleOptions } from "../../_utils.js";
import { norm, vaultFiles } from "../../_vault.js";

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const code = norm(url.searchParams.get("code"));
  const id = url.searchParams.get("id");
  const all = await vaultFiles(env);
  const f = all.find(x => x.id === id && x.code === code);
  if (!f) return jsonResponse({ code: 404, msg: "文件不存在" });
  const data = await env.GAIBANG_KV.get("vf:" + code + ":" + id);
  if (!data) return jsonResponse({ code: 404, msg: "文件内容已丢失" });
  return jsonResponse({ code: 200, name: f.name, data });
}
export async function onRequestOptions() { return handleOptions(); }
