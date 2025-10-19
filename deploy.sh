#!/bin/bash

# EV Map HTTPS 部署脚本
# 支持多种部署方式

set -e

echo "🚀 EV Map HTTPS 部署脚本"
echo "=========================="

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: $0 [dev|prod|docker]"
    echo ""
    echo "选项:"
    echo "  dev     - 启动 HTTPS 开发服务器"
    echo "  prod    - 构建并预览生产版本 (HTTPS)"
    echo "  docker  - 使用 Docker 部署"
    echo ""
    exit 1
fi

DEPLOY_MODE=$1

case $DEPLOY_MODE in
    "dev")
        echo "🔧 启动 HTTPS 开发服务器..."
        
        # 检查证书是否存在
        if [ ! -f "./certs/localhost.pem" ] || [ ! -f "./certs/localhost-key.pem" ]; then
            echo "⚠️  SSL 证书不存在，正在生成..."
            ./generate-certs.sh
        fi
        
        echo "✅ 启动开发服务器 (https://localhost:3000)"
        npm run dev:https
        ;;
        
    "prod")
        echo "🏗️  构建生产版本..."
        npm run build
        
        echo "🔧 启动 HTTPS 预览服务器..."
        echo "✅ 生产版本预览 (https://localhost:4173)"
        npm run preview:https
        ;;
        
    "docker")
        echo "🐳 使用 Docker 部署..."
        
        # 检查 Docker 是否安装
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker 未安装，请先安装 Docker"
            exit 1
        fi
        
        # 检查 Docker Compose 是否安装
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
            exit 1
        fi
        
        echo "🏗️  构建 Docker 镜像..."
        docker-compose build
        
        echo "🚀 启动 HTTPS 服务..."
        docker-compose up -d
        
        echo "✅ Docker 服务已启动"
        echo "📱 访问地址:"
        echo "   - HTTP:  http://localhost"
        echo "   - HTTPS: https://localhost"
        echo ""
        echo "📋 查看日志: docker-compose logs -f"
        echo "🛑 停止服务: docker-compose down"
        ;;
        
    *)
        echo "❌ 未知的部署模式: $DEPLOY_MODE"
        echo "支持的模式: dev, prod, docker"
        exit 1
        ;;
esac
