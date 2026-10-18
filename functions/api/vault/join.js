// 用协作码加入
import { jsonResponse, handleOptions, parseBody } from "../../_utils.js";
import { norm, vaults } from "../../_vault.js";

export async function onRequestPost(context) {
  const { env } = context;
  const { code, password } = await parseBody(context.request);
  const list = await vaults(env);
  const v = list.find(x => x.code === norm(code));
  if (!v) return jsonResponse({ code: 404, msg: "协作码不存在，请检查" });
  if (v.password && v.password !== password) {
    return jsonResponse({ code: 403, msg: "访问密码不正确" });
  }
  return jsonResponse({ code: 200, msg: "已加入", data: v });
}
export async function onRequestOptions() { return handleOptions(); }
