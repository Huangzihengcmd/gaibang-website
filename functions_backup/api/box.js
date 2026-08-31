import { getJSON, jsonResponse, handleOptions } from "../../_utils.js";

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") return handleOptions();
  if (context.request.method !== "GET") return jsonResponse({ code: 405, msg: "方法不允许" }, 405);

  const { env } = context;
  const boxData = await getJSON(env, "boxData", []);
  return jsonResponse({ code: 200, data: boxData });
}
