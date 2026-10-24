# -*- coding: utf-8 -*-
"""通过 GitHub API 提交文件（当 git push 被代理阻断时的备用通道）"""
import subprocess, json, base64, os, sys, tempfile, glob, re

REPO = "Huangzihengcmd/gaibang-website"
ROOT = r"F:\gaibang-website"

def find_wincred():
    """自动定位 git-credential-wincred.exe（PortableGit 升级后路径会变，不再硬编码）"""
    cands = []
    env = os.environ.get("PATH", "")
    git = None
    # 1. 从 PATH 里的 git 反推
    for p in env.split(os.pathsep):
        g = os.path.join(p.strip('"'), "git.exe")
        if os.path.exists(g):
            git = g
            break
    if git:
        base = os.path.dirname(os.path.dirname(git))  # .../mingw64
        cands.append(os.path.join(base, "bin", "git-credential-wincred.exe"))
    # 2. 常见安装位置全扫一遍
    for root in [r"C:\Users\Administrator\.workbuddy\binaries\PortableGit",
                 r"E:\WorkBuddy\resources\vendor\PortableGit",
                 r"C:\Program Files\Git"]:
        if os.path.isdir(root):
            cands += glob.glob(os.path.join(root, "**", "git-credential-wincred.exe"), recursive=True)
    # 3. 全盘兜底（只扫常见盘，限制深度避免太慢）
    for c in cands:
        if os.path.exists(c):
            return c
    return None

def get_token():
    exe = find_wincred()
    if not exe:
        print("ERROR: 找不到 git-credential-wincred.exe")
        return None, None
    try:
        r = subprocess.run([exe, "get"], input="protocol=https\nhost=github.com\n\n",
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
    except Exception as e:
        print("ERROR: 调用凭据助手失败 %s" % e)
        return None, None
    user = tok = None
    for line in (r.stdout or "").splitlines():
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

def orphan_works(remote_paths=None):
    """works/ 里存在、但 data.js 没记录的文件 = 孤儿。
    原因：模型改名或题目匹配修正后，旧文件不会被覆盖也没人删。
    这些文件虽然不在页面上显示，但仍在线可访问，会造成重复内容。"""
    import glob as _g
    try:
        src = open(os.path.join(ROOT, "aibench", "data.js"), encoding="utf-8").read()
        d = json.loads(re.search(r"window\.AIBENCH = (\{.*\});", src, re.S).group(1))
    except Exception:
        return []
    keep = set()
    for m in d.get("models", []):
        for fn in (m.get("works") or {}).values():
            keep.add(fn)
    out = []
    for p in _g.glob(os.path.join(ROOT, "aibench", "works", "*.html")):
        fn = os.path.basename(p)
        if fn not in keep:
            out.append("aibench/works/" + fn)
    # 远程残留：本地已删、但 GitHub 上还在的旧作品（改名或匹配修正后产生）
    for rp in (remote_paths or []):
        if (rp.startswith("aibench/works/") and rp.endswith(".html")
                and os.path.basename(rp) not in keep):
            if rp not in out:
                out.append(rp)
    return out


def glob_functions():
    """自动收集 functions 目录下所有 Cloudflare Function 文件
    （以前这里是硬编码列表，导致新增/修改的函数推不上去）"""
    return [os.path.relpath(p, ROOT).replace("\\", "/")
            for p in glob.glob(os.path.join(ROOT, "functions", "**", "*.js"), recursive=True)
            if os.path.isfile(p)]

USER, TOK = get_token()
if not TOK:
    print("NO_TOKEN - 无法从 Windows 凭据管理器读取 GitHub 凭据")
    sys.exit(1)

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
    "index.html", "news.html", "sites.html", "sitemap.xml", "robots.txt", "README.md",
    "db.json", "package.json", "vault.html", "server.cjs",
    "about.html", "contact.html", "BingSiteAuth.xml",
    "aibench/index.html", "aibench/data.js", "aibench/test.html",
    "aibench/t-astra.html", "aibench/t-watch.html", "aibench/t-billiards.html",
    "aibench/t-maze.html", "aibench/t-dunhuang.html", "aibench/t-topic6.html",
    "aibench/t-qingming.html",
    "tools/seo_inject.py", "tools/indexnow_submit.py",
    "tools/scan_aibench.py", "tools/api_push.py", "tools/check_remote.py", "tools/auto_sync.py",
    "tools/indexnow_submit.sh", "tools/make_fake_qrcode_svg.py",
    "tools/indexnow_retry.sh", "tools/indexnow_longrun.sh",
    "tools/push_retry.sh", "tools/indexnow_result.log", "tools/搜索引擎提交指引.md",
] + glob_works() + glob_functions()
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
delete = ["新建文本文档.txt", "start_https_silent.bat",
          "indexnow_submit.sh", "indexnow_retry.sh", "push_retry.sh", "indexnow_result.log",
          # 早期手工复制的重名作品，已被脚本生成的规范命名取代
          "aibench/works/seed-billiards.html", "aibench/works/seed-maze.html",
          "aibench/works/seed-qingming.html", "aibench/works/seed-watch.html",
          "aibench/works/qwen-watch.html",
          # 早期云囊的 functions 文件，路径写错（../_utils.js 解析不了）会导致
          # Cloudflare Pages 每次构建都失败，必须从仓库彻底删掉
          "functions/_vault.js",
          "functions/api/vault/create.js", "functions/api/vault/join.js",
          "functions/api/vault/upload.js", "functions/api/vault/files.js",
          "functions/api/vault/delete.js", "functions/api/vault/download.js"]
delete = delete + orphan_works(remote_paths)

_upsert_paths = set(upsert)
for f in delete:
    if f in _upsert_paths:
        continue
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
