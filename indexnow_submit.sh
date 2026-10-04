#!/bin/bash
# IndexNow 提交脚本（Bing/微软搜索收录）
HOST="gaibang.pages.dev"
KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90"

curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{
    \"host\": \"$HOST\",
    \"key\": \"$KEY\",
    \"keyLocation\": \"https://$HOST/$KEY.txt\",
    \"urlList\": [
      \"https://$HOST/\",
      \"https://$HOST/index.html\",
      \"https://$HOST/news.html\",
      \"https://$HOST/box.html\"
    ]
  }" -w "\nHTTP=%{http_code}\n"
