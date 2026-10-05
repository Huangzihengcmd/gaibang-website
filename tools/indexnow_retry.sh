#!/bin/bash
# 后台重试 IndexNow 提交，每 5 分钟一次，成功即停止
cd /f/gaibang-website
for i in $(seq 1 6); do
  R=$(bash indexnow_submit.sh 2>&1)
  echo "[$(date '+%H:%M:%S')] attempt $i: $R" >> indexnow_result.log
  if echo "$R" | grep -q "HTTP=200"; then
    echo "[$(date '+%H:%M:%S')] SUCCESS" >> indexnow_result.log
    break
  fi
  sleep 300
done
