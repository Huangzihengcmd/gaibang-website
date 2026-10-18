// 云囊 · 公共逻辑
import { getJSON, putJSON } from "../_utils.js";

export const MAX_SIZE = 3 * 1024 * 1024; // 单文件 3MB

export function genCode(n = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function norm(c) { return (c || "").toString().trim().toUpperCase(); }

export async function vaults(env) { return getJSON(env, "vaults", []); }
export async function vaultFiles(env) { return getJSON(env, "vaultFiles", []); }

export async function findVault(env, code) {
  const list = await vaults(env);
  return list.find(x => x.code === norm(code)) || null;
}