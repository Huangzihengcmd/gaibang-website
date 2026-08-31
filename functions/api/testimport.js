import { jsonResponse, getJSON } from "../_utils.js";

export async function onRequest(context) {
  const { env } = context;
  const testData = await getJSON(env, "testKey", "default value");
  return jsonResponse({ code: 200, data: testData });
}
