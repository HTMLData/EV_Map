# Windows 用户快速解决方案

## 🚨 当前问题
您在 Windows 上运行 `npm run generate-certs` 后没有看到结果，这是因为 npm 脚本执行方式的问题。

## ✅ 解决方案

### 方法1: 直接运行批处理脚本 (推荐)
```cmd
# 在项目根目录下直接运行
generate-certs.bat
```

### 方法2: 使用 Node.js 脚本
```cmd
# 运行跨平台 Node.js 脚本
npm run generate-certs
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

## 🔧 如果 OpenSSL 未安装

### 安装 OpenSSL (Windows)

#### 选项1: 使用 Chocolatey
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 OpenSSL
choco install openssl
```

#### 选项2: 下载 Git for Windows
从 [Git for Windows](https://git-scm.com/download/win) 下载并安装，它包含 OpenSSL。

#### 选项3: 直接下载 OpenSSL
从 [OpenSSL Windows](https://slproweb.com/products/Win32OpenSSL.html) 下载并安装。

## 🚀 生成证书后的步骤

1. **验证证书文件**
   ```cmd
   dir certs
   ```
   应该看到 `localhost.pem` 和 `localhost-key.pem` 文件。

2. **启动 HTTPS 服务**
   ```cmd
   npm run dev:https
   ```

3. **访问应用**
   - 本地: https://localhost:3000
   - 局域网: https://192.168.1.xxx:3000

## ⚠️ 重要提示

1. **浏览器安全警告**: 自签名证书会显示安全警告，点击"高级"→"继续访问"
2. **防火墙**: 确保 Windows 防火墙允许 Node.js 访问网络
3. **网络访问**: 使用局域网 IP 而不是公网 IP

## 🆘 如果仍有问题

请尝试以下步骤：

1. **检查 OpenSSL 安装**
   ```cmd
   openssl version
   ```

2. **检查证书目录**
   ```cmd
   dir certs
   ```

3. **手动运行批处理脚本**
   ```cmd
   generate-certs.bat
   ```

4. **查看详细错误信息**
   如果脚本失败，会显示具体的错误信息，请根据错误信息进行相应处理。
