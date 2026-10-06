# -*- coding: utf-8 -*-
"""
AI 能力检测 · 自动同步守护脚本
每隔一段时间检查 D:\\AI能力检测 是否有变动：
  有变动 -> 自动跑 scan_aibench.py（重新导入 + 生成 data.js）
         -> 自动跑 api_push.py（推送到 GitHub，Cloudflare 自动部署）
这样本地一更新，网站就自动跟着更新。

用法：python tools/auto_sync.py        （前台运行，可看到日志）
      python tools/auto_sync.py --once （只检查一次就退出）
"""
import os, sys, time, subprocess, hashlib, json

SRC = r"D:\AI能力检测"
ROOT = r"F:\gaibang-website"
STATE = os.path.join(ROOT, "tools", "auto_sync_state.json")
PY = r"C:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12\python.exe"
INTERVAL = 60          # 每 60 秒检查一次
MIN_GAP = 180          # 两次同步之间至少隔 3 分钟，避免频繁推送

def snapshot():
    """给文件夹拍个指纹：所有 html/txt 的路径+大小+修改时间"""
    items = []
    for dirpath, dirnames, filenames in os.walk(SRC):
        for fn in filenames:
            if not fn.lower().endswith((".html", ".txt")):
                continue
            p = os.path.join(dirpath, fn)
            try:
                st = os.stat(p)
                items.append("%s|%d|%d" % (os.path.relpath(p, SRC), st.st_size, int(st.st_mtime)))
            except Exception:
                pass
    items.sort()
    return hashlib.md5("\n".join(items).encode("utf-8")).hexdigest()

def run(script):
    r = subprocess.run([PY, os.path.join(ROOT, "tools", script)],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    print(r.stdout.strip()[:800])
    if r.stderr.strip():
        print("  [stderr]", r.stderr.strip()[:300])
    return r.returncode

def sync():
    print("[%s] 检测到变动，开始同步…" % time.strftime("%H:%M:%S"))
    run("scan_aibench.py")
    code = run("api_push.py")
    if code == 0:
        print("[%s] 同步完成，网站将在 1~2 分钟内更新" % time.strftime("%H:%M:%S"))
    else:
        print("[%s] 推送失败（网络？），稍后自动重试" % time.strftime("%H:%M:%S"))

def main():
    once = "--once" in sys.argv
    last = snapshot()
    last_sync = 0
    print("自动同步已启动，监控：%s" % SRC)
    print("检查间隔 %d 秒。改动文件后会自动导入并上线。Ctrl+C 停止。\n" % INTERVAL)

    while True:
        time.sleep(INTERVAL)
        try:
            cur = snapshot()
        except Exception as e:
            print("扫描出错：", e); continue
        if cur != last:
            now = time.time()
            if now - last_sync >= MIN_GAP:
                sync()
                last_sync = now
            else:
                print("[%s] 有变动，但距上次同步不足 %d 秒，稍候再同步"
                      % (time.strftime("%H:%M:%S"), MIN_GAP))
            last = cur
        if once:
            break

if __name__ == "__main__":
    main()
