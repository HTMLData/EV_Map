#!/bin/bash

# EV Map 快速启动脚本
# 自动检测系统并启动相应服务

echo "🚀 EV Map 快速启动脚本"
echo "========================"

# 检测操作系统
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    OS="linux"
fi

echo "🖥️  检测到操作系统: $OS"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查证书
if [ ! -f "certs/localhost.pem" ] || [ ! -f "certs/localhost-key.pem" ]; then
    echo "🔐 生成 SSL 证书..."
    if [ "$OS" = "windows" ]; then
        generate-certs.bat
    else
        ./generate-certs.sh
    fi
fi

# 启动服务
echo "🚀 启动 HTTPS 开发服务器..."
if [ "$OS" = "windows" ]; then
    npm run dev:https
else
    npm run dev:https
fi
