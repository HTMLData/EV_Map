# Windows 系统 HTTPS 部署指南

## 🚀 Windows 快速启动

### 前置要求
1. **Node.js** >= 16.0.0
2. **OpenSSL** (用于生成证书)
3. **Git** (可选，用于版本控制)

### 📦 安装 OpenSSL (Windows)

#### 方法1: 使用 Chocolatey
```powershell
# 安装 Chocolatey (如果未安装)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 OpenSSL
choco install openssl
```

#### 方法2: 使用 Git Bash
如果您已安装 Git for Windows，可以使用 Git Bash 中的 OpenSSL：
```bash
# 在 Git Bash 中运行
openssl version
```

#### 方法3: 下载预编译版本
从 [OpenSSL 官网](https://slproweb.com/products/Win32OpenSSL.html) 下载并安装。

### 🔐 生成 SSL 证书

#### 自动生成 (推荐)
```cmd
# 运行批处理脚本
generate-certs.bat

# 或使用 npm 脚本
npm run generate-certs:win
```

#### 手动生成
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

### 🚀 启动服务

#### 开发环境
```cmd
# 启动 HTTPS 开发服务器
npm run dev:https

# 或使用部署脚本
deploy.bat dev
```

#### 生产预览
```cmd
# 构建并启动 HTTPS 预览
npm run serve:https

# 或使用部署脚本
deploy.bat prod
```

### 🌐 网络访问配置

#### 防火墙设置
1. 打开 Windows 防火墙设置
2. 点击"允许应用通过防火墙"
3. 添加 Node.js 或允许端口 3000

#### 网络访问
```cmd
# 检查端口是否被占用
netstat -ano | findstr :3000

# 查看本机 IP 地址
ipconfig
```

### 🔧 故障排除

#### 问题1: OpenSSL 命令不存在
```cmd
# 解决方案1: 添加到 PATH
# 将 OpenSSL 安装目录添加到系统 PATH 环境变量

# 解决方案2: 使用完整路径
"C:\Program Files\OpenSSL-Win64\bin\openssl.exe" version
```

#### 问题2: 证书生成失败
```cmd
# 检查权限
# 确保有写入 certs 目录的权限

# 手动创建目录
mkdir certs
```

#### 问题3: 外部网络无法访问
1. **检查防火墙**: 确保 Windows 防火墙允许 Node.js
2. **检查网络**: 确保设备在同一网络
3. **使用内网 IP**: 使用 `192.168.x.x` 而不是外网 IP

#### 问题4: 端口被占用
```cmd
# 查看端口占用
netstat -ano | findstr :3000

# 杀死占用进程
taskkill /PID <进程ID> /F

# 或使用其他端口
npm run dev:https -- --port 3001
```

### 📱 访问地址

- **本地访问**: https://localhost:3000
- **局域网访问**: https://192.168.1.xxx:3000
- **生产预览**: https://localhost:4173

### ⚠️ 重要提示

1. **浏览器安全警告**: 自签名证书会显示安全警告，点击"高级"→"继续访问"
2. **网络访问**: 确保防火墙允许端口 3000
3. **证书有效期**: 自签名证书有效期为 365 天
4. **生产环境**: 建议使用真实 SSL 证书

### 🆘 获取帮助

如果遇到问题，请检查：
1. Node.js 版本是否符合要求
2. OpenSSL 是否正确安装
3. 防火墙设置是否正确
4. 网络连接是否正常
