# Windows OpenSSL 安装完整指南

## 🚨 当前问题
OpenSSL 未安装，无法生成 SSL 证书。

## ✅ 解决方案 (按推荐顺序)

### 方案1: 安装 Chocolatey + OpenSSL (推荐)

#### 第一步：安装 Chocolatey
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

#### 第二步：安装 OpenSSL
```cmd
# 安装 OpenSSL
choco install openssl

# 验证安装
openssl version
```

#### 第三步：生成证书
```cmd
npm run generate-certs
```

### 方案2: 下载 Git for Windows (最简单)

1. 访问 [Git for Windows](https://git-scm.com/download/win)
2. 下载并安装
3. Git for Windows 包含 OpenSSL
4. 重新打开命令行窗口
5. 运行 `npm run generate-certs`

### 方案3: 直接下载 OpenSSL

1. 访问 [OpenSSL Windows](https://slproweb.com/products/Win32OpenSSL.html)
2. 下载 "Win64 OpenSSL v3.x.x" 或 "Win32 OpenSSL v3.x.x"
3. 安装到默认位置
4. 将 OpenSSL 安装目录添加到系统 PATH
5. 重新打开命令行窗口
6. 运行 `npm run generate-certs`

### 方案4: 临时使用 HTTP 模式

如果暂时不想安装 OpenSSL，可以使用 HTTP 模式：

```cmd
# 启动 HTTP 开发服务器
npm run dev

# 或使用批处理脚本
start-http.bat
```

## 🔧 安装后的验证

### 检查 OpenSSL 安装
```cmd
openssl version
```
应该显示版本信息，如：`OpenSSL 3.0.x`

### 检查 PATH 环境变量
```cmd
echo %PATH%
```
应该包含 OpenSSL 安装目录。

### 生成证书
```cmd
npm run generate-certs
```

### 启动 HTTPS 服务
```cmd
npm run dev:https
```

## 🚀 快速启动命令

### 安装 OpenSSL 后
```cmd
# 生成证书
npm run generate-certs

# 启动 HTTPS 服务
npm run dev:https
```

### 临时使用 HTTP
```cmd
# 启动 HTTP 服务
npm run dev

# 或使用批处理脚本
start-http.bat
```

## 📱 访问地址

- **HTTPS 模式**: https://localhost:3000
- **HTTP 模式**: http://localhost:3000
- **局域网访问**: http://192.168.1.xxx:3000

## ⚠️ 重要提示

1. **HTTPS 优势**: 更安全，支持现代浏览器功能
2. **HTTP 限制**: 某些功能可能受限（如地理位置 API）
3. **浏览器警告**: 自签名证书会显示安全警告
4. **防火墙**: 确保 Windows 防火墙允许 Node.js

## 🆘 故障排除

### 问题1: OpenSSL 命令不存在
```cmd
# 检查 PATH
echo %PATH%

# 手动添加到 PATH (临时)
set PATH=%PATH%;C:\Program Files\OpenSSL-Win64\bin
```

### 问题2: 权限问题
- 以管理员身份运行命令行
- 确保有写入 certs 目录的权限

### 问题3: 网络问题
- 检查防火墙设置
- 使用局域网 IP 而不是公网 IP

## 💡 推荐操作

1. **安装 Chocolatey** (最简单)
2. **安装 OpenSSL**
3. **生成证书**
4. **启动 HTTPS 服务**

这样就能享受完整的 HTTPS 功能了！
