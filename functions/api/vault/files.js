// 文件列表
import { jsonResponse, handleOptions } from "../../_utils.js";
import { norm, vaultFiles } from "../../_vault.js";

export async function onRequestGet(context) {
  const { env } = context;
  const code = norm(context.request.url.searchParams.get("code"));
  const all = await vaultFiles(env);
  const list = all.filter(f => f.code === code)
    .sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  return jsonResponse({ code: 200, data: list });
}
export async function onRequestOptions() { return handleOptions(); }
