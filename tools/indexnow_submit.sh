#!/bin/bash
# IndexNow 提交脚本（Bing/微软搜索收录）
# URL 清单直接读 sitemap.xml，以后加了新页面自动带上，不用手动维护
HOST="gaibang.pages.dev"
KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90"
SITEMAP="${SITEMAP:-F:/gaibang-website/sitemap.xml}"

URLS=$(python - "$SITEMAP" << 'PY'
import sys, re, json
s = open(sys.argv[1], encoding="utf-8").read()
locs = re.findall(r"<loc>(.*?)</loc>", s, re.S)
print(json.dumps(locs, ensure_ascii=False))
PY
)

curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{
    \"host\": \"$HOST\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://$HOST/$KEY.txt\",
    \"urlList\": $URLS
  }"
echo ""
