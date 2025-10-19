#!/bin/bash

# Vite缓存清理脚本
# 用于解决 "504 Outdated Optimize Dep" 错误

echo "🧹 清理Vite缓存..."

# 停止所有Vite进程
echo "1. 停止Vite进程..."
pkill -f "vite" 2>/dev/null || echo "   没有运行中的Vite进程"

# 清理Vite缓存
echo "2. 清理Vite缓存目录..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# 清理浏览器缓存提示
echo "3. 清理完成！"
echo ""
echo "💡 如果问题仍然存在，请："
echo "   - 清除浏览器缓存 (Ctrl+Shift+R)"
echo "   - 重启浏览器"
echo "   - 运行: npm run dev"
echo ""
echo "🚀 现在可以重新启动开发服务器了！"
