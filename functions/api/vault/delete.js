// 删除文件
import { jsonResponse, handleOptions, parseBody, putJSON } from "../../_utils.js";
import { norm, vaultFiles } from "../../_vault.js";

export async function onRequestPost(context) {
  const { env } = context;
  const { code, id } = await parseBody(context.request);
  const all = await vaultFiles(env);
  const idx = all.findIndex(x => x.id === id && x.code === norm(code));
  if (idx === -1) return jsonResponse({ code: 404, msg: "文件不存在" });
  await env.GAIBANG_KV.delete("vf:" + norm(code) + ":" + id);
  all.splice(idx, 1);
  await putJSON(env, "vaultFiles", all);
  return jsonResponse({ code: 200, msg: "已删除" });
}
export async function onRequestOptions() { return handleOptions(); }
