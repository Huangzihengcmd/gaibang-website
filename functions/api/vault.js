// 云囊 · 协作资料库（单文件入口，用 ?a= 区分动作）
import { getJSON, putJSON, jsonResponse, handleOptions, parseBody } from "../_utils.js";

const MAX_SIZE = 3 * 1024 * 1024;
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const genCode = (n = 8) => Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
const norm = c => (c || "").toString().trim().toUpperCase();
const vaults = env => getJSON(env, "vaults", []);
const vfiles = env => getJSON(env, "vaultFiles", []);

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return handleOptions();
  const url = new URL(request.url);
  const a = url.searchParams.get("a") || "";

  // 创建（个人 / 团队）
  if (a === "create" && request.method === "POST") {
    const { name, code, password, isTeam } = await parseBody(request);
    const list = await vaults(env);
    let myCode = norm(code);
    if (!myCode) { do { myCode = genCode(); } while (list.some(v => v.code === myCode)); }
    if (!/^[A-Z0-9]{4,16}$/.test(myCode)) return jsonResponse({ code: 400, msg: "协作码只能是 4-16 位字母或数字" });
    if (list.some(v => v.code === myCode)) return jsonResponse({ code: 409, msg: "该协作码已存在，换一个" });
    const item = { code: myCode, name: (name || (isTeam ? "团队资料库" : "我的资料库")).slice(0, 30), password: password || "", isTeam: !!isTeam, createdAt: new Date().toISOString() };
    await putJSON(env, "vaults", [...list, item]);
    return jsonResponse({ code: 200, msg: "创建成功", data: item });
  }

  // 加入
  if (a === "join" && request.method === "POST") {
    const { code, password } = await parseBody(request);
    const v = (await vaults(env)).find(x => x.code === norm(code));
    if (!v) return jsonResponse({ code: 404, msg: "协作码不存在，请检查" });
    if (v.password && v.password !== password) return jsonResponse({ code: 403, msg: "访问密码不正确" });
    return jsonResponse({ code: 200, msg: "已加入", data: v });
  }

  // 上传
  if (a === "upload" && request.method === "POST") {
    const { code, name, data } = await parseBody(request);
    const v = (await vaults(env)).find(x => x.code === norm(code));
    if (!v) return jsonResponse({ code: 404, msg: "协作码不存在" });
    const b64 = (data || "").split(",").pop() || "";
    if (!b64) return jsonResponse({ code: 400, msg: "文件内容为空" });
    if (b64.length * 0.75 > MAX_SIZE) return jsonResponse({ code: 413, msg: "单个文件不能超过 3MB" });
    const safe = (name || "file").replace(/[\\/:*?"<>|]/g, "_").slice(0, 120);
    const id = Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    await env.GAIBANG_KV.put("vf:" + v.code + ":" + id, b64);
    const item = { id, code: v.code, name: safe, size: Math.round(b64.length * 0.75), ext: (safe.match(/\.[a-z0-9]+$/i) || [""])[0], time: new Date().toISOString() };
    const all = await vfiles(env);
    all.push(item);
    await putJSON(env, "vaultFiles", all);
    return jsonResponse({ code: 200, msg: "已自动保存", data: item });
  }

  // 列表
  if (a === "files" && request.method === "GET") {
    const code = norm(url.searchParams.get("code"));
    const list = (await vfiles(env)).filter(f => f.code === code)
      .sort((x, y) => (y.time || "").localeCompare(x.time || ""));
    return jsonResponse({ code: 200, data: list });
  }

  // 下载（返回 base64）
  if (a === "download" && request.method === "GET") {
    const code = norm(url.searchParams.get("code"));
    const id = url.searchParams.get("id");
    const f = (await vfiles(env)).find(x => x.id === id && x.code === code);
    if (!f) return jsonResponse({ code: 404, msg: "文件不存在" });
    const data = await env.GAIBANG_KV.get("vf:" + code + ":" + id);
    if (!data) return jsonResponse({ code: 404, msg: "文件内容已丢失" });
    return jsonResponse({ code: 200, name: f.name, data });
  }

  // 删除
  if (a === "delete" && request.method === "POST") {
    const { code, id } = await parseBody(request);
    const all = await vfiles(env);
    const i = all.findIndex(x => x.id === id && x.code === norm(code));
    if (i === -1) return jsonResponse({ code: 404, msg: "文件不存在" });
    await env.GAIBANG_KV.delete("vf:" + norm(code) + ":" + id);
    all.splice(i, 1);
    await putJSON(env, "vaultFiles", all);
    return jsonResponse({ code: 200, msg: "已删除" });
  }

  return jsonResponse({ code: 404, msg: "未知操作" }, 404);
}
