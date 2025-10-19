# Windows ES 模块问题解决方案

## 🚨 问题描述
您遇到的错误是因为项目使用了 ES 模块 (`"type": "module"`)，但脚本使用了 CommonJS 语法。

## ✅ 解决方案

### 方法1: 使用 CommonJS 脚本 (推荐)
```cmd
# 现在应该可以正常工作了
npm run generate-certs
```

### 方法2: 直接运行批处理脚本
```cmd
# 最简单的方式
generate-certs.bat
```

### 方法3: 手动生成证书
```cmd
# 创建证书目录
mkdir certs

# 生成私钥
openssl genrsa -out certs\localhost-key.pem 2048

# 生成证书签名请求
openssl req -new -key certs\localhost-key.pem -out certs\localhost.csr -subj "/C=CN/ST=Beijing/L=Beijing/O=Volkswagen/OU=IT/CN=localhost"

# 生成自签名证书
openssl x509 -req -in certs\localhost.csr -signkey certs\localhost-key.pem -out certs\localhost.pem -days 365

# 清理临时文件
del certs\localhost.csr
```

## 🔧 技术说明

### 问题原因
- 项目 `package.json` 中设置了 `"type": "module"`
- 这使得所有 `.js` 文件被当作 ES 模块处理
- ES 模块使用 `import` 语法，而不是 `require`

### 解决方案
- 创建了 `.cjs` 文件，明确指定为 CommonJS 模块
- `.cjs` 文件可以使用 `require` 语法
- 这样避免了 ES 模块的兼容性问题

## 🚀 完整操作步骤

### 第一步：生成证书
```cmd
npm run generate-certs
```

### 第二步：启动 HTTPS 服务
```cmd
npm run dev:https
```

### 第三步：访问应用
- 本地: https://localhost:3000
- 局域网: https://192.168.1.xxx:3000

## ⚠️ 重要提示

1. **浏览器安全警告**: 自签名证书会显示安全警告
2. **防火墙设置**: 确保 Windows 防火墙允许 Node.js
3. **网络访问**: 使用局域网 IP 而不是公网 IP

## 🆘 如果仍有问题

请尝试以下步骤：

1. **检查 OpenSSL**
   ```cmd
   openssl version
   ```

2. **直接运行批处理脚本**
   ```cmd
   generate-certs.bat
   ```

3. **检查证书文件**
   ```cmd
   dir certs
   ```

现在应该可以正常工作了！
