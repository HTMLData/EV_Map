@echo off
chcp 65001 >nul
REM Windows 临时 HTTP 模式启动脚本
REM 当 OpenSSL 未安装时使用

echo 🚀 启动 EV Map 开发服务器 (HTTP 模式)
echo =====================================
echo.
echo ⚠️  注意: 当前使用 HTTP 模式，因为 OpenSSL 未安装
echo 💡 要使用 HTTPS，请先安装 OpenSSL
echo.

echo 📝 启动开发服务器...
npm run dev

echo.
echo 按任意键退出...
pause >nul
