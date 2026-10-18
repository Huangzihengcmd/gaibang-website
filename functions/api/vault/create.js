// 创建协作库（个人 / 团队）
import { jsonResponse, handleOptions, parseBody, putJSON } from "../../_utils.js";
import { genCode, norm, vaults } from "../../_vault.js";

export async function onRequestPost(context) {
  const { env } = context;
  const { name, code, password, isTeam } = await parseBody(context.request);
  const list = await vaults(env);
  let myCode = norm(code);
  if (!myCode) { do { myCode = genCode(); } while (list.some(v => v.code === myCode)); }
  if (!/^[A-Z0-9]{4,16}$/.test(myCode)) {
    return jsonResponse({ code: 400, msg: "协作码只能是 4-16 位字母或数字" });
  }
  if (list.some(v => v.code === myCode)) {
    return jsonResponse({ code: 409, msg: "该协作码已存在，换一个" });
  }
  const item = {
    code: myCode,
    name: (name || (isTeam ? "团队资料库" : "我的资料库")).slice(0, 30),
    password: password || "",
    isTeam: !!isTeam,
    createdAt: new Date().toISOString(),
  };
  await putJSON(env, "vaults", [...list, item]);
  return jsonResponse({ code: 200, msg: "创建成功", data: item });
}
export async function onRequestOptions() { return handleOptions(); }
