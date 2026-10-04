#!/bin/bash
cd /f/gaibang-website
for i in $(seq 1 15); do
  echo "=== attempt $i ==="
  timeout 60 git -c http.sslVerify=false push origin main 2>&1 | tail -2
  if timeout 25 git -c http.sslVerify=false ls-remote origin 2>/dev/null | grep -q "9bd79e2\|$(git rev-parse --short HEAD)"; then
    echo "PUSHED_OK"
    break
  fi
  sleep 20
done
echo "=== final remote ==="
timeout 25 git -c http.sslVerify=false ls-remote origin 2>/dev/null | head -1
