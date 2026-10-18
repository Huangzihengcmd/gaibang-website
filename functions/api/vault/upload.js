// 上传文件（base64 存 KV，自动保存）
import { jsonResponse, handleOptions, parseBody, putJSON } from "../../_utils.js";
import { norm, findVault, vaultFiles, MAX_SIZE } from "../../_vault.js";

export async function onRequestPost(context) {
  const { env } = context;
  const { code, name, data } = await parseBody(context.request);
  const v = await findVault(env, code);
  if (!v) return jsonResponse({ code: 404, msg: "协作码不存在" });

  const b64 = (data || "").split(",").pop() || "";
  if (!b64) return jsonResponse({ code: 400, msg: "文件内容为空" });
  if (b64.length * 0.75 > MAX_SIZE) return jsonResponse({ code: 413, msg: "单个文件不能超过 3MB" });

  const safe = (name || "file").replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
  const id = Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  await env.GAIBANG_KV.put("vf:" + v.code + ":" + id, b64);

  const item = {
    id, code: v.code, name: safe,
    size: Math.round(b64.length * 0.75),
    ext: (safe.match(/\.[a-z0-9]+$/i) || [""])[0],
    time: new Date().toISOString(),
  };
  const all = await vaultFiles(env);
  all.push(item);
  await putJSON(env, "vaultFiles", all);
  return jsonResponse({ code: 200, msg: "已自动保存", data: item });
}
export async function onRequestOptions() { return handleOptions(); }
