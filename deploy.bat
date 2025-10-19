@echo off
REM Windows 部署脚本
REM EV Map HTTPS 部署脚本

echo 🚀 EV Map HTTPS 部署脚本
echo ==========================

if "%1"=="" (
    echo 用法: %0 [dev^|prod^|docker]
    echo.
    echo 选项:
    echo   dev     - 启动 HTTPS 开发服务器
    echo   prod    - 构建并预览生产版本 (HTTPS)
    echo   docker  - 使用 Docker 部署
    echo.
    goto :end
)

set DEPLOY_MODE=%1

if "%DEPLOY_MODE%"=="dev" goto :dev
if "%DEPLOY_MODE%"=="prod" goto :prod
if "%DEPLOY_MODE%"=="docker" goto :docker
echo ❌ 未知的部署模式: %DEPLOY_MODE%
echo 支持的模式: dev, prod, docker
goto :end

:dev
echo 🔧 启动 HTTPS 开发服务器...

REM 检查证书是否存在
if not exist "certs\localhost.pem" if not exist "certs\localhost-key.pem" (
    echo ⚠️  SSL 证书不存在，正在生成...
    call generate-certs.bat
)

echo ✅ 启动开发服务器 (https://localhost:3000)
npm run dev:https
goto :end

:prod
echo 🏗️  构建生产版本...
npm run build

echo 🔧 启动 HTTPS 预览服务器...
echo ✅ 生产版本预览 (https://localhost:4173)
npm run preview:https
goto :end

:docker
echo 🐳 使用 Docker 部署...

REM 检查 Docker 是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装，请先安装 Docker Desktop
    goto :end
)

REM 检查 Docker Compose 是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose 未安装，请先安装 Docker Compose
    goto :end
)

echo 🏗️  构建 Docker 镜像...
docker-compose build

echo 🚀 启动 HTTPS 服务...
docker-compose up -d

echo ✅ Docker 服务已启动
echo 📱 访问地址:
echo    - HTTP:  http://localhost
echo    - HTTPS: https://localhost
echo.
echo 📋 查看日志: docker-compose logs -f
echo 🛑 停止服务: docker-compose down

:end
pause
