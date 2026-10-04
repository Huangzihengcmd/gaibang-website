# 丐帮网站项目长期备忘

- 线上地址: https://gaibang.pages.dev （Cloudflare Pages，GitHub main 自动部署）
- GitHub: Huangzihengcmd/gaibang-website
- 管理员: njzj_2580@qq.com / 12345678；界面只显示"管理员"，禁止出现"丐帮帮主"字样
- 双后端: functions/ = Cloudflare Pages Functions+KV（线上）；server.cjs = Express 本地/Render（启动: node server.cjs）
- 本机 git 推送要点: 加速器需开启；`git -c http.sslVerify=false push origin main`；凭据助手固定 wincred（勿改回 manager，会弹窗/崩溃）；上传常静默失败，用 ls-remote 验证后重试
