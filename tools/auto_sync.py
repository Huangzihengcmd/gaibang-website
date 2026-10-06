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
import os, sys, time, subprocess, hashlib, logging

SRC = r"D:\AI能力检测"
ROOT = r"F:\gaibang-website"
LOG = os.path.join(ROOT, "tools", "auto_sync.log")
PY = r"C:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12\python.exe"
INTERVAL = 60          # 每 60 秒检查一次
MIN_GAP = 60           # 两次同步最小间隔（改小，保证新作品能及时上线）
HEARTBEAT = 600        # 每 10 分钟写一次心跳，方便确认脚本还活着

logging.basicConfig(
    filename=LOG, level=logging.INFO,
    format="%(asctime)s %(message)s", datefmt="%m-%d %H:%M:%S",
    encoding="utf-8",
)
def log(msg):
    print(msg, flush=True)
    logging.info(msg)

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
    for line in (r.stdout or "").strip().splitlines():
        log("  | " + line)
    if (r.stderr or "").strip():
        log("  [stderr] " + r.stderr.strip()[:200])
    return r.returncode

def sync():
    log("检测到变动，开始同步")
    run("scan_aibench.py")
    code = run("api_push.py")
    if code == 0:
        log("同步完成，网站将在 1~2 分钟内更新")
    else:
        log("推送失败（网络问题），下次检查会重试")

def main():
    once = "--once" in sys.argv
    last = snapshot()
    last_sync = 0
    last_beat = 0
    log("=== 自动同步启动，监控 %s ===" % SRC)

    while True:
        time.sleep(INTERVAL)
        try:
            cur = snapshot()
        except Exception as e:
            log("扫描出错：%s" % e); continue

        now = time.time()
        if cur != last:
            if now - last_sync >= MIN_GAP:
                sync(); last_sync = now
            last = cur
        if now - last_beat >= HEARTBEAT:
            log("心跳：脚本运行中")
            last_beat = now
        if once:
            break

if __name__ == "__main__":
    main()
