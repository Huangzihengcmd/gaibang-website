# -*- coding: utf-8 -*-
"""IndexNow 主动推送（Windows 版，读 sitemap.xml 里的全部 URL）
用法：python tools/indexnow_submit.py
"""
import re, json, os, subprocess, sys

ROOT = r"F:/gaibang-website"
HOST = "gaibang.pages.dev"
KEY = "a1b2c3d4e5f60718293a4b5c6d7e8f90"
SITEMAP = os.path.join(ROOT, "sitemap.xml")

s = open(SITEMAP, encoding="utf-8").read()
locs = re.findall(r"<loc>(.*?)</loc>", s, re.S)
print("sitemap 内 URL 数：%d" % len(locs))

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": f"https://{HOST}/{KEY}.txt",
    "urlList": locs,
}
tmp = os.path.join(ROOT, "tools", "_indexnow.json")
with open(tmp, "w", encoding="utf-8") as f:
    json.dump(payload, f, ensure_ascii=False)

r = subprocess.run(
    ["curl", "-s", "--max-time", "120", "-X", "POST",
     "https://api.indexnow.org/indexnow",
     "-H", "Content-Type: application/json; charset=utf-8",
     "--data-binary", "@" + tmp],
    capture_output=True, text=True, encoding="utf-8", errors="replace")
os.remove(tmp)
print("IndexNow 响应：", r.stdout.strip() or "(空=成功)", "| HTTP", r.returncode)
