# -*- coding: utf-8 -*-
"""
AI 能力检测 · 自动导入脚本（全自动发现版）

规则：
  - 题目 = 说明目录里的每一个 .txt（新增题目只需丢一个 txt 进去）
  - 模型 = 源码目录下的每一个子目录（新增模型只需建个目录放作品）
  - 作品 = 各模型目录里的 .html，按关键词匹配到题目
  - 卡片上只显示「有提交」的模型，未提交的不出现

匹配词来自 tools/aibench_config.json 的 alias；未在配置里的新题目，
会自动用题目名拆词匹配，并在输出里提示需要补配置。

用法：python tools/scan_aibench.py
"""
import os, re, json, shutil, glob, datetime

SRC = r"D:\AI能力检测"
DST = r"F:\gaibang-website\aibench\works"
DATA = r"F:\gaibang-website\aibench\data.js"
CFG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aibench_config.json")

DEFAULT_GRADS = [
    "radial-gradient(circle at 50% 30%, #1f3a5f 0%, #101d2e 55%, #060a12 100%)",
    "radial-gradient(circle at 50% 30%, #4a1d5c 0%, #26102f 55%, #0d0710 100%)",
    "radial-gradient(circle at 50% 30%, #17372f 0%, #0d1a17 55%, #060708 100%)",
    "radial-gradient(circle at 50% 30%, #3d2f14 0%, #231a0b 55%, #0c0904 100%)",
    "radial-gradient(circle at 50% 30%, #16394a 0%, #0b1e28 55%, #040a0e 100%)",
    "radial-gradient(circle at 50% 30%, #5c1d2b 0%, #2e1017 55%, #100609 100%)",
]

def slugify(name):
    s = name.lower()
    s = re.sub(r"[（(].*?[)）]", "", s)
    s = re.sub(r"[^a-z0-9]+", "", s)
    return s or "model"

def load_config():
    if os.path.exists(CFG):
        try:
            with open(CFG, encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print("配置文件读取失败：%s" % e)
    return {}

def discover_tests(config):
    """说明目录里每个 txt = 一道题"""
    note_dir = os.path.join(SRC, "说明")
    tests, need_cfg = [], []
    if not os.path.isdir(note_dir):
        print("警告：找不到说明目录 %s" % note_dir)
        return tests, need_cfg

    files = sorted(glob.glob(os.path.join(note_dir, "*.txt")))
    for i, txt in enumerate(files):
        base = os.path.splitext(os.path.basename(txt))[0]
        try:
            with open(txt, encoding="utf-8", errors="replace") as f:
                prompt = f.read().strip()
        except Exception:
            prompt = ""

        c = config.get(base) or config.get(base.replace(" ", "")) or {}
        if not c:
            words = [w for w in re.split(r"[\s\-_]+", base) if w]
            c = {
                "id": "topic%d" % (i + 1),
                "name": base,
                "en": words[0].upper() if words else base.upper(),
                "sub": "未分类",
                "alias": words + [base, base.replace(" ", "")],
                "grad": DEFAULT_GRADS[i % len(DEFAULT_GRADS)],
            }
            need_cfg.append(base)

        tests.append({
            "id": c.get("id") or slugify(base) or ("topic%d" % (i + 1)),
            "name": c.get("name") or base,
            "en": c.get("en") or base.upper(),
            "sub": c.get("sub") or "未分类",
            "grad": c.get("grad") or DEFAULT_GRADS[i % len(DEFAULT_GRADS)],
            "alias": c.get("alias") or [base],
            "prompt": prompt,
        })
    return tests, need_cfg

def match_test(filename, tests):
    low = os.path.basename(filename).lower()
    flat = low.replace(" ", "").replace("-", "").replace("_", "")
    for t in tests:
        for kw in t["alias"]:
            k = kw.lower().replace(" ", "").replace("-", "").replace("_", "")
            if k and (k in low or k in flat):
                return t
    return None

def main():
    os.makedirs(DST, exist_ok=True)
    config = load_config()
    tests, need_cfg = discover_tests(config)

    models = {}
    unmatched = []

    for entry in sorted(os.listdir(SRC)):
        full = os.path.join(SRC, entry)
        if not os.path.isdir(full) or entry == "说明":
            continue
        slug = slugify(entry)
        models[slug] = {"name": entry, "works": {}, "dates": {}}

        for html in glob.glob(os.path.join(full, "**", "*.html"), recursive=True):
            t = match_test(html, tests)
            if not t:
                unmatched.append(os.path.relpath(html, SRC)); continue
            target = "%s-%s.html" % (slug, t["id"])
            shutil.copy2(html, os.path.join(DST, target))
            models[slug]["works"][t["id"]] = target
            try:
                mt = os.path.getmtime(html)
                models[slug]["dates"][t["id"]] = datetime.datetime.fromtimestamp(mt).strftime("%Y-%m-%d")
            except Exception:
                models[slug]["dates"][t["id"]] = ""

    # 只保留有提交的模型
    model_list = [{"slug": s, "name": m["name"], "works": m["works"], "dates": m["dates"]}
                  for s, m in models.items() if m["works"]]
    model_list.sort(key=lambda m: (-len(m["works"]), m["name"]))

    data = {
        "tests": [{k: t[k] for k in ("id", "name", "en", "sub", "grad", "prompt")} for t in tests],
        "models": model_list,
    }
    with open(DATA, "w", encoding="utf-8") as f:
        f.write("// 由 tools/scan_aibench.py 自动生成，请勿手改\n")
        f.write("window.AIBENCH = ")
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    total = sum(len(m["works"]) for m in model_list)
    print("题目 %d 道（来自说明目录）｜模型 %d 个｜作品 %d 份" % (len(tests), len(model_list), total))
    for t in tests:
        n = sum(1 for m in model_list if t["id"] in m["works"])
        flag = "" if t["prompt"] else "  [缺说明原文]"
        print("  %-22s %2d 份%s" % (t["name"], n, flag))
    print("模型：" + "、".join("%s(%d)" % (m["name"], len(m["works"])) for m in model_list))

    if need_cfg:
        print("\n新题目未配置（已用默认规则处理，建议补进 aibench_config.json）：")
        for b in need_cfg: print("  -", b)
    if unmatched:
        print("\n以下作品没匹配到任何题目（检查文件名或补 alias）：")
        for u in unmatched: print("  -", u)

if __name__ == "__main__":
    main()
