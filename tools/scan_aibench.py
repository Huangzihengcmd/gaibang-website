# -*- coding: utf-8 -*-
"""
AI 能力检测 · 自动导入脚本
扫描 D:\\AI能力检测：
  - 说明/*.txt  -> 题目的原始要求（原文照搬，不改写、不编造）
  - 各 AI 目录/*.html -> 作品，复制到网站目录
生成 aibench/data.js 供页面渲染。

用法：python tools/scan_aibench.py
以后有新作品：丢进文件夹，跑一次即可（auto_sync.py 会自动跑）。
"""
import os, re, json, shutil, glob, datetime

SRC = r"D:\AI能力检测"
DST = r"F:\gaibang-website\aibench\works"
DATA = r"F:\gaibang-website\aibench\data.js"

# 五道题：keywords 匹配作品文件名；note 匹配「说明」里的 txt 文件名
TESTS = [
    {"id": "watch", "name": "机械天文腕表", "icon": "⌚",
     "keywords": ["天文", "watch", "clock"], "note": "天文机械表"},
    {"id": "qingming", "name": "赛博朋克清明上河图", "icon": "🏙️",
     "keywords": ["清明", "qingming"], "note": "赛博朋克清明上河图"},
    {"id": "billiards", "name": "开放式 3D 台球", "icon": "🎱",
     "keywords": ["台球", "billiard"], "note": "开放式3D台球"},
    {"id": "maze", "name": "开放式 3D 迷宫", "icon": "🌀",
     "keywords": ["迷宫", "maze"], "note": "开放式3D迷宫"},
    {"id": "astra", "name": "Astra 星域粒子", "icon": "✨",
     "keywords": ["astra", "星域", "粒子"], "note": "Astra 星域粒子"},
]

def slugify(name):
    s = name.lower()
    s = re.sub(r"[（(].*?[)）]", "", s)
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s or "model"

def load_notes():
    """读取说明目录里的原始题目文本"""
    notes = {}
    note_dir = os.path.join(SRC, "说明")
    if not os.path.isdir(note_dir):
        return notes
    for txt in glob.glob(os.path.join(note_dir, "*.txt")):
        base = os.path.splitext(os.path.basename(txt))[0]
        try:
            with open(txt, encoding="utf-8", errors="replace") as f:
                notes[base] = f.read().strip()
        except Exception:
            continue
    return notes

def match_test(filename):
    low = filename.lower()
    for t in TESTS:
        for kw in t["keywords"]:
            if kw.lower() in low:
                return t
    return None

def main():
    os.makedirs(DST, exist_ok=True)
    notes = load_notes()

    # 说明原文挂到题目上（原文，不改写）
    for t in TESTS:
        t["prompt"] = ""
        flat_note = t["note"].replace(" ", "")
        for base, content in notes.items():
            if t["note"] in base or base.replace(" ", "") in flat_note or flat_note in base.replace(" ", ""):
                t["prompt"] = content
                break

    models = {}
    skipped = []

    for entry in sorted(os.listdir(SRC)):
        full = os.path.join(SRC, entry)
        if not os.path.isdir(full) or entry == "说明":
            continue
        slug = slugify(entry)
        models[slug] = {"name": entry, "works": {}, "dates": {}}

        for html in glob.glob(os.path.join(full, "**", "*.html"), recursive=True):
            base = os.path.basename(html)
            t = match_test(base)
            if not t:
                skipped.append(base); continue
            target = "%s-%s.html" % (slug, t["id"])
            shutil.copy2(html, os.path.join(DST, target))
            models[slug]["works"][t["id"]] = target
            # 用源文件最后修改时间作为交稿日期
            try:
                mt = os.path.getmtime(html)
                models[slug]["dates"][t["id"]] = datetime.datetime.fromtimestamp(mt).strftime("%Y-%m-%d")
            except Exception:
                models[slug]["dates"][t["id"]] = ""

    data = {
        "tests": [{k: t[k] for k in ("id", "name", "prompt")} for t in TESTS],
        "models": [{"slug": s, "name": m["name"], "works": m["works"], "dates": m["dates"]}
                   for s, m in models.items() if m["works"]],
    }
    with open(DATA, "w", encoding="utf-8") as f:
        f.write("// 由 tools/scan_aibench.py 自动生成，请勿手改\n")
        f.write("window.AIBENCH = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    total = sum(len(m["works"]) for m in models.values())
    print("导入完成：%d 个模型，%d 个作品" % (len(data["models"]), total))
    for t in data["tests"]:
        flag = "有原文" if t["prompt"] else "缺原文!"
        n = sum(1 for m in data["models"] if t["id"] in m["works"])
        print("  %-22s 说明:%s 作品:%d 份" % (t["name"], flag, n))
    if skipped:
        print("未识别的文件：", skipped)

if __name__ == "__main__":
    main()
