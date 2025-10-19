#!/bin/bash

# 生成自签名 SSL 证书脚本
# 用于本地 HTTPS 开发环境

echo "🔐 正在生成自签名 SSL 证书..."

# 检查是否已存在证书
if [ -f "./certs/localhost.pem" ] && [ -f "./certs/localhost-key.pem" ]; then
    echo "⚠️  证书已存在，是否重新生成？(y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "✅ 使用现有证书"
        exit 0
    fi
fi

# 生成私钥
echo "📝 生成私钥..."
openssl genrsa -out ./certs/localhost-key.pem 2048

# 生成证书签名请求
echo "📝 生成证书签名请求..."
openssl req -new -key ./certs/localhost-key.pem -out ./certs/localhost.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=Volkswagen/OU=IT/CN=localhost"

# 生成自签名证书
echo "📝 生成自签名证书..."
openssl x509 -req -in ./certs/localhost.csr -signkey ./certs/localhost-key.pem -out ./certs/localhost.pem -days 365

# 清理临时文件
rm ./certs/localhost.csr

echo "✅ SSL 证书生成完成！"
echo "📁 证书位置:"
echo "   - 证书文件: ./certs/localhost.pem"
echo "   - 私钥文件: ./certs/localhost-key.pem"
echo ""
echo "🚀 现在可以启动 HTTPS 开发服务器:"
echo "   npm run dev"
echo ""
echo "⚠️  注意: 浏览器会显示安全警告，请点击 '高级' -> '继续访问'"
