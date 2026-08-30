@echo off
title 丐帮网站 HTTPS 本地测试
:: 静默模式，双击即可自动生成证书并启动 HTTPS

:: 检查 mkcert 是否安装
where mkcert >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] 没有找到 mkcert，请先安装 mkcert
    pause
    exit /b
)

:: 检查 http-server 是否安装
where http-server >nul 2>&1
if %errorlevel% neq 0 (
    npm install -g http-server
)

:: 生成证书（如果已有会覆盖）
mkcert -install
mkcert localhost

:: 启动 HTTPS 网站
start "" "https://localhost:8080"
http-server -S -C localhost.pem -K localhost-key.pem >nul 2>&1

exit