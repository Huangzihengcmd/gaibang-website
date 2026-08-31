import { getJSON, putJSON, jsonResponse, handleOptions, parseBody } from "../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "POST") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { request, env } = context;
  const body = await parseBody(request);
  const { email, name, school, grade, className } = body;

  let applyList = await getJSON(env, "applyList", []);
  const index = applyList.findIndex(item => item.email === email);
  const applyInfo = {
    email, name, school, grade, className,
    status: "pending",
    createTime: new Date().toLocaleString()
  };
  index > -1 ? applyList[index] = applyInfo : applyList.push(applyInfo);
  await putJSON(env, "applyList", applyList);

  return jsonResponse({ code: 200, msg: "申请提交成功，等待管理员审核" });
}
