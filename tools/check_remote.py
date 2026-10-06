# -*- coding: utf-8 -*-
"""检查远程 GitHub 仓库里某个文件是否存在"""
import subprocess, json, sys
REPO = "Huangzihengcmd/gaibang-website"
WINCRED = r"C:\Users\Administrator\.workbuddy\binaries\PortableGit\versions\1.2.0\mingw64\bin\git-credential-wincred.exe"
r = subprocess.run([WINCRED, "get"], input="protocol=https\nhost=github.com\n\n", capture_output=True, text=True)
user = tok = None
for line in r.stdout.splitlines():
    if line.startswith("username="): user = line.split("=", 1)[1]
    if line.startswith("password="): tok = line.split("=", 1)[1]

for path in ["box.html", "box_editor.html", "sites.html", "BingSiteAuth.xml", "index.html"]:
    out = subprocess.run(["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "25",
                          "-u", "%s:%s" % (user, tok),
                          "https://api.github.com/repos/%s/contents/%s" % (REPO, path)],
                         capture_output=True, text=True)
    print("%-20s -> %s (200=存在, 404=已删除)" % (path, out.stdout))
