# EV Map 充电桩查找系统

## 📋 项目概述

这是一个基于 Vue 3 + Vite 的充电桩查找系统，专为大众汽车用户设计。系统实现了充电桩查找、详情查看、导航规划等核心功能，支持 HTTPS 安全部署。

### 🚗 核心功能
- **充电桩查找**: 基于地图的充电桩搜索和筛选
- **详情查看**: 详细的充电桩信息和设施服务
- **导航规划**: 集成高德地图的路线规划功能
- **实时状态**: 充电桩可用状态实时显示
- **HTTPS 支持**: 完整的 HTTPS 部署方案

### 🎨 UI/UX 设计
- **大众汽车风格**: 采用大众汽车品牌色彩和设计语言
- **移动端优先**: 响应式设计，完美适配移动设备
- **冷色系配色**: 蓝/灰/白配色方案，简洁现代
- **流畅动画**: 丰富的交互动画效果

### 🛠 技术栈
- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **UI组件库**: Vant 4
- **地图服务**: 高德地图 JS SDK
- **网络请求**: Axios
- **HTTPS 支持**: SSL/TLS 证书

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 标准启动流程
```bash
# 1. 安装依赖
npm install

# 2. 生成 SSL 证书
npm run generate-certs

# 3. 启动 HTTPS 服务
npm run dev:https
```

### 快速启动（可选）
```bash
# macOS/Linux
./generate-certs.sh && npm run dev:https

# Windows
generate-certs.bat && npm run dev:https
```

## 🖥️ macOS/Linux 部署指南

### HTTPS 开发服务器

#### 生成 SSL 证书
```bash
# 生成自签名证书（首次运行）
npm run generate-certs

# 或使用脚本
./generate-certs.sh
```

#### 启动 HTTPS 服务
```bash
# 启动 HTTPS 开发服务器
npm run dev:https

# 或使用部署脚本
./deploy.sh dev
```

#### 生产环境部署
```bash
# 构建并启动 HTTPS 预览
npm run serve:https

# 或使用部署脚本
./deploy.sh prod
```

#### Docker 部署
```bash
# 使用 Docker Compose 部署
./deploy.sh docker

# 手动 Docker 部署
docker-compose up -d
```

### macOS/Linux 注意事项

1. **权限问题**: 确保脚本有执行权限
   ```bash
   chmod +x generate-certs.sh
   chmod +x deploy.sh
   ```

2. **OpenSSL 安装**: macOS 通常已包含 OpenSSL
   ```bash
   # 检查 OpenSSL
   openssl version
   
   # 如果未安装，使用 Homebrew
   brew install openssl
   ```

3. **防火墙设置**: 确保端口 3000 和 4173 未被占用
   ```bash
   # 检查端口占用
   lsof -i :3000
   lsof -i :4173
   ```

## 🪟 Windows 部署指南

### HTTPS 开发服务器

#### 安装 OpenSSL

**方案1: 使用 Chocolatey (推荐)**
```powershell
# 以管理员身份运行 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 OpenSSL
choco install openssl
```

**方案2: 下载 Git for Windows (最简单)**
1. 访问 [Git for Windows](https://git-scm.com/download/win)
2. 下载并安装
3. Git for Windows 包含 OpenSSL

**方案3: 直接下载 OpenSSL**
1. 访问 [OpenSSL Windows](https://slproweb.com/products/Win32OpenSSL.html)
2. 下载并安装到默认位置

#### 生成 SSL 证书
```cmd
# 生成自签名证书
npm run generate-certs

# 或使用批处理脚本
generate-certs.bat

# 或使用增强版脚本
generate-certs-enhanced.bat
```

#### 启动 HTTPS 服务
```cmd
# 启动 HTTPS 开发服务器
npm run dev:https

# 或使用部署脚本
deploy.bat dev
```

#### 临时 HTTP 模式
```cmd
# 如果暂时不想安装 OpenSSL
npm run dev

# 或使用批处理脚本
start-http.bat
```

### Windows 注意事项

1. **OpenSSL 安装**: 必须安装 OpenSSL 才能使用 HTTPS
   ```cmd
   # 验证 OpenSSL 安装
   openssl version
   ```

2. **防火墙设置**: 确保 Windows 防火墙允许 Node.js
   - 控制面板 → Windows Defender 防火墙
   - 允许应用通过防火墙
   - 添加 Node.js 或允许端口 3000

3. **PATH 环境变量**: 确保 OpenSSL 在系统 PATH 中
   ```cmd
   # 检查 PATH
   echo %PATH%
   ```

4. **权限问题**: 以管理员身份运行命令行（如需要）

## 🔧 构建和运行说明

### 开发环境

#### HTTP 模式
```bash
# 启动 HTTP 开发服务器
npm run dev

# 访问: http://localhost:3000
```

#### HTTPS 模式
```bash
# 生成证书（首次运行）
npm run generate-certs

# 启动 HTTPS 开发服务器
npm run dev:https

# 访问: https://localhost:3000
```

### 生产环境

#### 构建项目
```bash
# 构建生产版本
npm run build
```

#### 预览生产版本
```bash
# HTTP 预览
npm run preview

# HTTPS 预览
npm run preview:https

# 构建并启动 HTTPS 预览
npm run serve:https
```

#### Docker 部署
```bash
# 构建 Docker 镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 可执行脚本

#### macOS/Linux
- `./generate-certs.sh` - 生成 SSL 证书
- `./deploy.sh dev` - 启动开发服务器
- `./deploy.sh prod` - 构建并预览生产版本
- `./deploy.sh docker` - Docker 部署

#### Windows
- `generate-certs.bat` - 生成 SSL 证书
- `generate-certs-enhanced.bat` - 增强版证书生成
- `deploy.bat dev` - 启动开发服务器
- `deploy.bat prod` - 构建并预览生产版本
- `deploy.bat docker` - Docker 部署
- `start-http.bat` - 启动 HTTP 模式

## 📱 访问地址

### 开发环境
- **本地 HTTP**: http://localhost:3000
- **本地 HTTPS**: https://localhost:3000
- **局域网 HTTP**: http://192.168.1.xxx:3000
- **局域网 HTTPS**: https://192.168.1.xxx:3000

### 生产环境
- **本地预览**: https://localhost:4173
- **Docker 部署**: https://localhost

## ⚠️ 重要提示

### 浏览器安全警告
使用自签名证书时，浏览器会显示安全警告：
- **Chrome**: 点击"高级" → "继续访问localhost（不安全）"
- **Firefox**: 点击"高级" → "接受风险并继续"
- **Safari**: 点击"显示详细信息" → "访问此网站"

### 网络访问
- **局域网访问**: 使用 `192.168.1.xxx` 格式的 IP 地址
- **公网访问**: 需要路由器端口转发配置
- **防火墙**: 确保防火墙允许相应端口

### 证书管理
- **自签名证书**: 有效期为 365 天
- **生产环境**: 建议使用真实 SSL 证书（如 Let's Encrypt）
- **证书更新**: 到期后需要重新生成

## 🔧 配置说明

### 高德地图配置
在 `src/config/amap.js` 中配置高德地图相关参数：
```javascript
export const amapConfig = {
  key: 'your-amap-api-key',  // 请替换为您的实际API Key
  version: '2.0',
  // ... 其他配置
}
```

### Vite HTTPS 配置
在 `vite.config.js` 中已配置 HTTPS：
```javascript
server: {
  https: {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem')
  }
}
```

### Mock 数据
Mock 数据位于 `mock/stations.json`，包含示例充电桩数据。

## 🆘 故障排除

### 常见问题

#### 1. 证书生成失败
```bash
# 检查 OpenSSL 安装
openssl version

# 手动生成证书
# macOS/Linux
./generate-certs.sh

# Windows
generate-certs.bat
```

#### 2. 端口被占用
```bash
# 检查端口占用
# macOS/Linux
lsof -i :3000

# Windows
netstat -ano | findstr :3000

# 杀死占用进程
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <进程ID> /F
```

#### 3. 网络访问问题
- 检查防火墙设置
- 确保使用局域网 IP
- 验证端口是否开放

#### 4. Docker 问题
```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

## 📁 项目结构

```
src/
├── api/                    # API服务层
│   └── mockService.js      # Mock数据服务
├── components/             # 组件
│   ├── MapView.vue        # 地图组件
│   └── StationCard.vue    # 充电桩卡片组件
├── config/                # 配置文件
│   └── amap.js           # 高德地图配置
├── stores/               # 状态管理
│   ├── stationStore.js   # 充电桩状态
│   └── businessStore.js  # 业务流程状态
├── views/                # 页面
│   ├── Home.vue         # 主页（地图+列表）
│   ├── StationDetail.vue # 充电桩详情页
│   ├── ChargeSession.vue # 充电会话页
│   └── Pay.vue          # 支付页
├── router/               # 路由配置
│   └── index.js
├── App.vue              # 根组件
└── main.js              # 入口文件
```

## 🌐 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

