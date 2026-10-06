# -*- coding: utf-8 -*-
"""
AI 能力检测 · 自动导入脚本
扫描 D:\\AI能力检测 文件夹，把各 AI 交的作品 HTML 复制到网站目录，
并生成 aibench/data.js 供页面渲染。

用法：python tools/scan_aibench.py
以后有新的 AI 作品，把文件丢进对应文件夹，再跑一次这个脚本即可。
"""
import os, re, json, shutil, glob

SRC = r"D:\AI能力检测"
DST = r"F:\gaibang-website\aibench\works"
DATA = r"F:\gaibang-website\aibench\data.js"

# 五道测试题：关键词用于匹配文件名
TESTS = [
    {"id": "watch", "name": "机械天文腕表", "icon": "⌚",
     "keywords": ["天文", "watch", "clock"],
     "desc": "用单个 HTML 实现机械腕表风格的天文时钟：平滑扫秒且不漂移、月相计算、计时码表（含计圈）、日期窗、日出日落指示，纯原生不许用任何库。"},
    {"id": "qingming", "name": "赛博朋克清明上河图", "icon": "🏙️",
     "keywords": ["清明", "qingming"],
     "desc": "用代码画一幅动态赛博朋克版《清明上河图》长卷：自动从右向左滚动、至少 50 个动态元素、鼠标悬停弹出赛博风信息卡片。"},
    {"id": "billiards", "name": "开放式 3D 台球", "icon": "🎱",
     "keywords": ["台球", "billiard"],
     "desc": "开放式命题：先说出你认为一个好的 3D 台球网页该具备哪些体验、玩法、视觉与交互要点，再据此开发成可直接体验的完整作品。"},
    {"id": "maze", "name": "开放式 3D 迷宫", "icon": "🌀",
     "keywords": ["迷宫", "maze"],
     "desc": "开放式命题：题目只给一句话「请你做一个 3D 迷宫」，其余规格由模型自行理解发挥。"},
    {"id": "astra", "name": "Astra 星域粒子", "icon": "✨",
     "keywords": ["astra", "星域", "粒子"],
     "desc": "复刻 OpenAI GPT-6 Astra 页面的滚动粒子星域：粒子沿曲线聚成图形、滚动散作星海、鼠标推动粒子、可拖拽旋转，考察 WebGL 着色器与 GPU 粒子渲染。"},
]

def slugify(name):
    """目录名 -> 英文短名"""
    s = name.lower()
    s = re.sub(r"[（(].*?[)）]", "", s)          # 去掉括号内容
    s = re.sub(r"[^a-z0-9]+", "", s)             # 只留字母数字
    return s or "model"

def match_test(filename):
    low = filename.lower()
    for t in TESTS:
        for kw in t["keywords"]:
            if kw.lower() in low:
                return t
    return None

def main():
    os.makedirs(DST, exist_ok=True)
    models = {}   # slug -> {name, works:{test_id:file}}
    skipped = []

    for entry in sorted(os.listdir(SRC)):
        full = os.path.join(SRC, entry)
        if not os.path.isdir(full) or entry == "说明":
            continue
        slug = slugify(entry)
        models[slug] = {"name": entry, "works": {}}

        for html in glob.glob(os.path.join(full, "**", "*.html"), recursive=True):
            base = os.path.basename(html)
            t = match_test(base)
            if not t:
                skipped.append(base)
                continue
            target = "%s-%s.html" % (slug, t["id"])
            dst_path = os.path.join(DST, target)
            shutil.copy2(html, dst_path)
            models[slug]["works"][t["id"]] = target

    # 生成 data.js
    data = {
        "tests": TESTS,
        "models": [{"slug": s, "name": m["name"], "works": m["works"]}
                   for s, m in models.items() if m["works"]],
    }
    with open(DATA, "w", encoding="utf-8") as f:
        f.write("// 本文件由 tools/scan_aibench.py 自动生成，请勿手改\n")
        f.write("window.AIBENCH = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    total = sum(len(m["works"]) for m in models.values())
    print("导入完成：%d 个模型，%d 个作品" % (len(data["models"]), total))
    for m in data["models"]:
        print("  %-45s %s" % (m["name"], ", ".join(sorted(m["works"].keys()))))
    if skipped:
        print("未识别（没匹配到题目）的文件：")
        for s in skipped:
            print("  -", s)

if __name__ == "__main__":
    main()
