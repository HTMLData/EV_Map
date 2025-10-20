@echo off
chcp 65001 >nul
REM EV Map 快速启动脚本 (Windows)
REM 自动检测环境并启动相应服务

echo 🚀 EV Map 快速启动脚本
echo ========================

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    npm install
)

REM 检查证书
if not exist "certs\localhost.pem" if not exist "certs\localhost-key.pem" (
    echo 🔐 生成 SSL 证书...
    call generate-certs.bat
)

REM 启动服务
echo 🚀 启动 HTTPS 开发服务器...
npm run dev:https

pause
