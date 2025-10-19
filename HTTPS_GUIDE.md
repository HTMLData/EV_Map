# EV Map HTTPS 快速启动指南

## 🚀 一键启动 HTTPS 服务

### 开发环境
```bash
# 1. 安装依赖
npm install

# 2. 生成 SSL 证书（首次运行）
npm run generate-certs

# 3. 启动 HTTPS 开发服务器
npm run dev:https
```

### 生产环境预览
```bash
# 构建并启动 HTTPS 预览
npm run serve:https
```

### Docker 部署
```bash
# 一键 Docker 部署
./deploy.sh docker
```

## 📱 访问地址

- **开发环境**: https://localhost:3000
- **生产预览**: https://localhost:4173
- **Docker 部署**: https://localhost

## ⚠️ 重要提示

1. **浏览器安全警告**: 使用自签名证书时，浏览器会显示安全警告
   - Chrome: 点击"高级" → "继续访问localhost（不安全）"
   - Firefox: 点击"高级" → "接受风险并继续"
   - Safari: 点击"显示详细信息" → "访问此网站"

2. **证书有效期**: 自签名证书有效期为365天，到期后需要重新生成

3. **生产环境**: 生产环境请使用真实的 SSL 证书（如 Let's Encrypt）

## 🔧 故障排除

### 证书生成失败
```bash
# 手动生成证书
openssl genrsa -out ./certs/localhost-key.pem 2048
openssl req -new -key ./certs/localhost-key.pem -out ./certs/localhost.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=Volkswagen/OU=IT/CN=localhost"
openssl x509 -req -in ./certs/localhost.csr -signkey ./certs/localhost-key.pem -out ./certs/localhost.pem -days 365
rm ./certs/localhost.csr
```

### 端口被占用
```bash
# 检查端口占用
lsof -i :3000
lsof -i :4173

# 杀死占用进程
kill -9 <PID>
```

### Docker 问题
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

## 📞 技术支持

如有问题，请参考：
- README.md 详细文档
- nginx-https.conf Nginx 配置示例
- Dockerfile 容器化配置
