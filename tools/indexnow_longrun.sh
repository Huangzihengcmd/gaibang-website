#!/bin/bash
# IndexNow 长期重试：每 30 分钟一次，共 12 次（约 6 小时）
cd /f/gaibang-website
for i in $(seq 1 12); do
  R=$(bash indexnow_submit.sh 2>&1)
  echo "[$(date '+%m-%d %H:%M')] attempt $i: $(echo "$R" | tr -d '\n')" >> indexnow_result.log
  if echo "$R" | grep -q "HTTP=200"; then
    echo "[$(date '+%m-%d %H:%M')] SUCCESS - 已提交给 IndexNow（Bing/微软）" >> indexnow_result.log
    break
  fi
  sleep 1800
done
