# -*- coding: utf-8 -*-
"""通过 GitHub API 提交文件（当 git push 被代理阻断时的备用通道）"""
import subprocess, json, base64, os, sys, tempfile, glob

REPO = "Huangzihengcmd/gaibang-website"
ROOT = r"F:\gaibang-website"
WINCRED = r"C:\Users\Administrator\.workbuddy\binaries\PortableGit\versions\1.2.0\mingw64\bin\git-credential-wincred.exe"

def get_token():
    r = subprocess.run([WINCRED, "get"], input="protocol=https\nhost=github.com\n\n",
                       capture_output=True, text=True)
    user = tok = None
    for line in r.stdout.splitlines():
        if line.startswith("username="): user = line.split("=", 1)[1]
        if line.startswith("password="): tok = line.split("=", 1)[1]
    return user, tok

def glob_works():
    """自动收集 aibench/works 下所有作品文件（含 vendor）"""
    out = []
    for p in glob.glob(os.path.join(ROOT, "aibench", "works", "**", "*"), recursive=True):
        if os.path.isfile(p):
            rel = os.path.relpath(p, ROOT).replace("\\", "/")
            out.append(rel)
    return out

USER, TOK = get_token()
if not TOK:
    print("NO_TOKEN"); sys.exit(1)

def api(method, path, data=None):
    url = "https://api.github.com/repos/%s%s" % (REPO, path)
    cmd = ["curl", "-s", "--max-time", "60", "-X", method, "-u", "%s:%s" % (USER, TOK),
           "-H", "Accept: application/vnd.github+json"]
    tmp = None
    if data is not None:
        # 用临时文件传 body，避免 Windows 命令行长度限制（WinError 206）
        fd, tmp = tempfile.mkstemp(suffix=".json")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
        cmd += ["-H", "Content-Type: application/json", "--data-binary", "@" + tmp]
    cmd.append(url)
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    finally:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)
    try:
        return json.loads(r.stdout)
    except Exception:
        return {"_raw": r.stdout[:300]}

# 1. 当前 commit / tree
ref = api("GET", "/git/ref/heads/main")
if "object" not in ref:
    print("REF_FAIL", ref); sys.exit(1)
base_commit = ref["object"]["sha"]
cm = api("GET", "/git/commits/%s" % base_commit)
base_tree = cm["tree"]["sha"]
print("base_commit=%s tree=%s" % (base_commit[:7], base_tree[:7]))

# 2. 远程现有文件清单
remote_tree = api("GET", "/git/trees/%s?recursive=1" % base_commit)
remote_paths = set()
if "tree" in remote_tree:
    remote_paths = {t["path"] for t in remote_tree["tree"] if t["type"] == "blob"}
print("remote files: %d" % len(remote_paths))

# 3. 新增/修改
upsert = [
    "index.html", "news.html", "sites.html", "sitemap.xml", "robots.txt",
    "about.html", "contact.html", "BingSiteAuth.xml",
    "aibench/index.html", "aibench/data.js",
    "tools/scan_aibench.py", "tools/api_push.py", "tools/check_remote.py",
    "tools/indexnow_submit.sh", "tools/make_fake_qrcode_svg.py",
    "tools/indexnow_retry.sh", "tools/indexnow_longrun.sh",
    "tools/push_retry.sh", "tools/indexnow_result.log", "tools/搜索引擎提交指引.md",
] + glob_works()
changes = []
for f in upsert:
    p = os.path.join(ROOT, f)
    if not os.path.exists(p):
        print("skip(missing) %s" % f); continue
    data = open(p, "rb").read()
    b64 = base64.b64encode(data).decode()
    blob = api("POST", "/git/blobs", {"content": b64, "encoding": "base64"})
    if "sha" in blob:
        changes.append({"path": f.replace("\\", "/"), "mode": "100644", "type": "blob", "sha": blob["sha"]})
        print("upsert ok  %s" % f)
    else:
        print("upsert FAIL %s -> %s" % (f, blob))

# 4. 删除（仅删远程确实存在的）
delete = ["box.html", "box_editor.html", "新建文本文档.txt", "start_https_silent.bat",
          "indexnow_submit.sh", "indexnow_retry.sh", "push_retry.sh", "indexnow_result.log"]
for f in delete:
    if f in remote_paths:
        changes.append({"path": f, "mode": "100644", "type": "blob", "sha": None})
        print("delete      %s" % f)

if not changes:
    print("NOTHING_TO_COMMIT"); sys.exit(0)

# 5. 建 tree -> commit -> 更新 ref
tree = api("POST", "/git/trees", {"base_tree": base_tree, "tree": changes})
if "sha" not in tree:
    print("TREE_FAIL", tree); sys.exit(1)
print("tree created %s" % tree["sha"][:7])

msg = "Simplify structure: remove 百宝箱, add 分舵 hub, clean root, add Bing verification"
commit = api("POST", "/git/commits", {"message": msg, "tree": tree["sha"], "parents": [base_commit]})
if "sha" not in commit:
    print("COMMIT_FAIL", commit); sys.exit(1)
print("commit created %s" % commit["sha"][:7])

upd = api("PATCH", "/git/refs/heads/main", {"sha": commit["sha"]})
if "object" in upd:
    print("PUSHED_OK -> %s" % upd["object"]["sha"][:7])
else:
    print("REF_UPDATE_FAIL", upd)
