# -*- coding: utf-8 -*-
"""
云囊之外再加一层：给 AI 能力检测站补 SEO 文本层
------------------------------------------------------------------
为什么需要这个：
  作品页（works/*.html）全是 SVG / canvas 视觉内容，正文一个字没有，
  title 也是作品自己写的（比如 "LUNARIS · 天文机械腕表"），
  必应爬过去看到的是"一张没有文字的图"，根本不知道这是什么页面。
  题目页 test.html?id=xxx 所有题目共用一份 HTML，标题统一叫"题目详情"，
  长尾词一个都没进去。

这个脚本做三件事（跑在 scan_aibench.py 之后、api_push.py 之前）：
  1. 给每个作品页注入 SEO 标签 + 一段可被索引的文字说明（折叠面板，不破坏视觉）
  2. 为每道题生成一个独立静态页 aibench/t-<题目id>.html（真正的长尾词落地页）
  3. 输出新的 sitemap 条目列表

注意：works/*.html 每次同步都会被源目录覆盖，所以必须靠这个脚本重新注入，
不能手工改作品页。一键同步.bat 里已经加上了这一步。
"""
import os, re, json, html

ROOT = r"F:\gaibang-website"
AIB = os.path.join(ROOT, "aibench")
WORKS = os.path.join(AIB, "works")
DATA = os.path.join(AIB, "data.js")
SITE = "https://gaibang.pages.dev"

# 作品页里已有的 title，注入时要替换掉
TITLE_RE = re.compile(r"<title>.*?</title>", re.S | re.I)


def load_data():
    s = open(DATA, encoding="utf-8").read()
    m = re.search(r"window\.AIBENCH = (\{.*\});", s, re.S)
    if not m:
        raise SystemExit("data.js 解析失败")
    return json.loads(m.group(1))


def esc(t):
    return html.escape(t or "", quote=True)


def short(prompt, n=110):
    p = re.sub(r"\s+", " ", (prompt or "").strip())
    return p[:n] + ("…" if len(p) > n else "")


def build_head(t, model, page_url):
    """生成要插入 <head> 里的 SEO 标签"""
    name = t["name"]
    title = f"{name} · {model} 的 AI 实作 | 丐帮 AI 能力检测"
    desc = (f"「{name}」题目下，{model} 的 AI 实作作品。"
            f"题目要求：{short(t.get('prompt'))} "
            f"由丐帮 AI 能力检测收录，可在浏览器直接打开查看完整效果。")
    return f"""<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}" />
<link rel="canonical" href="{page_url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="丐帮 AI 能力检测" />
<meta property="og:title" content="{esc(title)}" />
<meta property="og:description" content="{esc(desc)}" />
<meta property="og:url" content="{page_url}" />
<meta name="keywords" content="{esc(name)},{esc(model)},AI 实作,HTML 单文件,{esc(t.get('en') or '')}" />"""


def build_panel(t, model, page_url, others):
    """作品页底部可折叠的文字说明（默认收起，不影响视觉观感）"""
    links = " ".join(
        f'<a href="{SITE}/aibench/works/{o["file"]}" rel="nofollow">{esc(o["model"])}</a>'
        for o in others
    )
    return f"""
<details class="gb-seo">
<summary>本页说明 · {esc(t['name'])} · {esc(model)}</summary>
<div class="gb-seo-body">
<h1>{esc(t['name'])} — {esc(model)} 的实现</h1>
<p><b>题目</b>：{esc(t.get('prompt'))}</p>
<p><b>模型</b>：{esc(model)}　<b>收录站点</b>：丐帮 AI 能力检测</p>
<p><b>同题其他模型</b>：{links}</p>
<p><b>返回</b>：<a href="{SITE}/aibench/">全部题目</a> · <a href="{SITE}/aibench/t-{esc(t['id'])}.html">本题对照页</a></p>
</div>
</details>"""


PANEL_CSS = """
<style>
.gb-seo{position:fixed;left:0;right:0;bottom:0;z-index:99999;
  font:13px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  color:#e8ecf3;background:rgba(8,10,16,.94);border-top:1px solid rgba(255,255,255,.14)}
.gb-seo>summary{cursor:pointer;padding:7px 14px;list-style:none;opacity:.72;font-size:12px;
  text-align:center;user-select:none}
.gb-seo>summary::-webkit-details-marker{display:none}
.gb-seo[open]>summary{opacity:1;border-bottom:1px solid rgba(255,255,255,.1)}
.gb-seo-body{max-height:34vh;overflow:auto;padding:14px 18px}
.gb-seo-body h1{font-size:15px;font-weight:500;margin:0 0 10px;color:#ffd700}
.gb-seo-body p{margin:6px 0}
.gb-seo-body a{color:#7fb4ff}
@media print{.gb-seo{display:none}}
</style>"""


def inject_works(data):
    """给每个作品页注入 SEO 标签和文字面板"""
    tests = {t["id"]: t for t in data["tests"]}
    # 反查：每个题目下各模型的作品文件
    per_test = {}
    for m in data["models"]:
        for tid, fn in (m.get("works") or {}).items():
            per_test.setdefault(tid, []).append({"model": m["name"], "file": fn})

    n = 0
    for m in data["models"]:
        for tid, fn in (m.get("works") or {}).items():
            p = os.path.join(WORKS, fn)
            if not os.path.exists(p):
                continue
            t = tests.get(tid)
            if not t:
                continue
            htmlsrc = open(p, encoding="utf-8", errors="replace").read()
            url = f"{SITE}/aibench/works/{fn}"
            others = [o for o in per_test.get(tid, []) if o["file"] != fn]

            # 1) 替换 title，插入 meta
            head_html = build_head(t, m["name"], url)
            if TITLE_RE.search(htmlsrc):
                htmlsrc = TITLE_RE.sub(head_html, htmlsrc, count=1)
            else:
                htmlsrc = htmlsrc.replace("</head>", head_html + "\n</head>", 1)

            # 2) 插入样式 + 文字面板（只插一次）
            if "gb-seo" not in htmlsrc:
                panel = build_panel(t, m["name"], url, others)
                if "</body>" in htmlsrc:
                    htmlsrc = htmlsrc.replace("</body>", panel + "\n</body>", 1)
                else:
                    htmlsrc += panel
                if "PANEL_CSS" not in htmlsrc and ".gb-seo{" not in htmlsrc:
                    htmlsrc = htmlsrc.replace("</head>", PANEL_CSS + "\n</head>", 1)

            open(p, "w", encoding="utf-8").write(htmlsrc)
            n += 1
    return n


TOPIC_TPL = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content="{desc}" />
<link rel="canonical" href="{url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="丐帮 AI 能力检测" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{desc}" />
<meta property="og:url" content="{url}" />
<meta name="keywords" content="{kw}" />
<link rel="stylesheet" href="style.css" />
<style>
body{{background:#0a0c12;color:#e8ecf3;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
  margin:0;padding:0 18px 60px;line-height:1.8}}
.wrap{{max-width:860px;margin:0 auto}}
h1{{font-size:26px;font-weight:500;color:#ffd700;margin:28px 0 6px}}
.sub{{color:#8a93a5;font-size:13px;margin-bottom:22px}}
.card{{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);border-radius:12px;
  padding:18px 20px;margin-bottom:14px}}
.card h2{{font-size:15px;font-weight:500;color:#ffd700;margin:0 0 10px}}
.prompt{{white-space:pre-wrap;color:#cfd6e4;font-size:14px;margin:0}}
table{{width:100%;border-collapse:collapse;margin-top:6px}}
th,td{{text-align:left;padding:9px 8px;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px}}
th{{color:#8a93a5;font-weight:400;font-size:12px}}
td a{{color:#7fb4ff;text-decoration:none}}
td a:hover{{text-decoration:underline}}
.count{{color:#8a93a5;font-size:13px;margin:0 0 18px}}
.back{{display:inline-block;margin-top:8px;color:#ffd700;text-decoration:none;font-size:14px}}
.back:hover{{text-decoration:underline}}
</style>
</head>
<body>
<div class="wrap">
<h1>{h1}</h1>
<div class="sub">{sub}</div>

<div class="card">
<h2>题目原文</h2>
<p class="prompt">{prompt}</p>
</div>

<div class="count">共 {count} 个模型提交了本题作品，点击进入可直接在浏览器打开。</div>

<div class="card">
<h2>各模型作品对照</h2>
<table>
<tr><th style="width:38%">模型</th><th>作品</th><th>提交时间</th></tr>
{rows}
</table>
</div>

<a class="back" href="{SITE}/aibench/">← 丐帮 AI 能力检测 · 全部题目</a>
</div>
</body>
</html>
"""


def gen_topic_pages(data):
    """为每道题生成独立静态页（长尾词落地页）"""
    tests = data["tests"]
    # 题目 -> [(模型名, 文件, 日期)]
    per_test = {}
    for m in data["models"]:
        dates = m.get("dates") or {}
        for tid, fn in (m.get("works") or {}).items():
            per_test.setdefault(tid, []).append(
                {"model": m["name"], "file": fn, "date": (dates.get(tid) or "")[:10]})

    made = []
    for t in tests:
        items = per_test.get(t["id"], [])
        slug = f"t-{t['id']}"
        url = f"{SITE}/aibench/{slug}.html"
        title = f"{t['name']} 题目与各 AI 作品对照 | 丐帮 AI 能力检测"
        desc = (f"「{t['name']}」完整题目原文，以及 {len(items)} 个 AI 模型（"
                + "、".join(i["model"] for i in items[:6]) + "）的实现作品对照。"
                "全部为单个 HTML 文件，浏览器直接打开。")
        kw = ",".join([t["name"], t.get("en") or "", "AI 作品对照", "HTML 单文件"] +
                      [i["model"] for i in items[:4]])
        rows = "\n".join(
            f'<tr><td>{esc(i["model"])}</td>'
            f'<td><a href="{SITE}/aibench/works/{i["file"]}" rel="nofollow">打开作品</a></td>'
            f'<td style="color:#8a93a5">{esc(i["date"])}</td></tr>'
            for i in sorted(items, key=lambda x: x["model"])
        )
        sub = esc(t.get("sub") or "") + ("　·　" + esc(t.get("en") or "") if t.get("en") else "")
        page = TOPIC_TPL.format(
            title=esc(title), desc=esc(desc), url=url, kw=esc(kw),
            h1=esc(t["name"]), sub=sub, prompt=esc(t.get("prompt")),
            count=len(items), rows=rows, SITE=SITE)
        open(os.path.join(AIB, slug + ".html"), "w", encoding="utf-8").write(page)
        made.append(slug)
    return made


if __name__ == "__main__":
    data = load_data()
    n = inject_works(data)
    pages = gen_topic_pages(data)
    urls = []
    for m in data["models"]:
        for fn in (m.get("works") or {}).values():
            urls.append(f"{SITE}/aibench/works/{fn}")
    for p in pages:
        urls.append(f"{SITE}/aibench/{p}.html")
    print("作品页注入 SEO：%d 个" % n)
    print("生成题目落地页：%d 个（%s）" % (len(pages), "、".join(pages)))
    with open(os.path.join(ROOT, "tools", "seo_urls.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(urls))
    print("URL 清单已写入 tools/seo_urls.txt（%d 条）" % len(urls))
