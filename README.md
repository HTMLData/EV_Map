# EV_Map 充电桩查找系统

## 项目概述

这是一个基于 Vue 3 + Vite 的充电桩查找系统，专为大众汽车用户设计。系统实现了充电桩查找、详情查看、导航规划等核心功能。

## 功能特性

### 🚗 核心功能
- **充电桩查找**: 基于地图的充电桩搜索和筛选
- **详情查看**: 详细的充电桩信息和设施服务
- **导航规划**: 集成高德地图的路线规划功能
- **实时状态**: 充电桩可用状态实时显示

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
- **样式**: SCSS

## 项目结构

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

## 主要更新

### 🔄 Tesla → Volkswagen 品牌更新
- ✅ 所有Tesla相关类名和样式已替换为Volkswagen
- ✅ 更新了充电桩标记图标，添加大众Logo标识
- ✅ 调整了品牌色彩方案，符合大众汽车设计规范
- ✅ 更新了mock数据中的运营商信息

### 🗺 地图功能增强
- ✅ 集成高德地图JS SDK，支持完整的地图交互
- ✅ 实现了充电桩标记点显示和状态区分
- ✅ 添加了用户定位功能
- ✅ 支持路线规划和导航功能
- ✅ 创建了统一的地图配置文件

### 🧩 组件架构优化
- ✅ 创建了StationCard组件，提供统一的充电桩卡片样式
- ✅ 完善了MapView组件，支持更多地图交互功能
- ✅ 优化了StationDetail页面，提供更丰富的信息展示

### 🔌 API服务层
- ✅ 创建了完整的mockService.js，提供API接口抽象
- ✅ 支持真实API和Mock数据的无缝切换
- ✅ 实现了充电桩、用户、充电会话、支付等完整API

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### HTTPS 开发服务器

#### macOS/Linux
```bash
# 生成 SSL 证书（首次运行）
npm run generate-certs

# 启动 HTTPS 开发服务器
npm run dev:https
# 或使用部署脚本
./deploy.sh dev
```

#### Windows
```cmd
# 生成 SSL 证书（首次运行）
npm run generate-certs:win
# 或直接运行
generate-certs.bat

# 启动 HTTPS 开发服务器
npm run dev:https
# 或使用部署脚本
deploy.bat dev
```

### HTTP 开发服务器（传统方式）
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### HTTPS 生产预览
```bash
npm run serve:https
# 或使用部署脚本
./deploy.sh prod
```

### Docker HTTPS 部署
```bash
# 使用 Docker Compose 部署
./deploy.sh docker

# 手动 Docker 部署
docker-compose up -d
```

## HTTPS 部署指南

### 🔐 SSL 证书配置

#### 开发环境（自签名证书）
项目已配置自动生成自签名证书：
```bash
# 生成自签名证书
npm run generate-certs
```

#### 生产环境（真实证书）
推荐使用 Let's Encrypt 免费证书：
```bash
# 使用 certbot 获取证书
sudo certbot certonly --webroot -w /var/www/html -d your-domain.com
```

### 🚀 部署方式

#### 1. 本地 HTTPS 开发
```bash
# 启动 HTTPS 开发服务器
npm run dev:https
# 访问: https://localhost:3000
```

#### 2. 生产环境预览
```bash
# 构建并启动 HTTPS 预览
npm run serve:https
# 访问: https://localhost:4173
```

#### 3. Docker 部署
```bash
# 使用 Docker Compose
./deploy.sh docker

# 手动部署
docker-compose up -d
```

#### 4. Nginx 部署
1. 构建项目：`npm run build`
2. 配置 Nginx（参考 `nginx-https.conf`）
3. 上传 `dist` 目录到服务器
4. 配置 SSL 证书路径

### 🔧 配置说明

#### Vite HTTPS 配置
在 `vite.config.js` 中已配置 HTTPS：
```javascript
server: {
  https: {
    key: fs.readFileSync('./certs/localhost-key.pem'),
    cert: fs.readFileSync('./certs/localhost.pem')
  }
}
```

#### 高德地图配置
在 `src/config/amap.js` 中配置高德地图相关参数：

```javascript
export const amapConfig = {
  key: 'your-amap-api-key',  // 请替换为您的实际API Key
  version: '2.0',
  // ... 其他配置
}
```

### Mock数据
Mock数据位于 `mock/stations.json`，包含8个示例充电桩数据。

## 开发指南

### 添加新的充电桩
在 `mock/stations.json` 中添加新的充电桩数据：

```json
{
  "id": 9,
  "name": "新充电站",
  "address": "详细地址",
  "latitude": 39.9087,
  "longitude": 116.4668,
  "distance": 1.2,
  "type": ["快充", "慢充"],
  "status": "空闲",
  "totalPorts": 12,
  "availablePorts": 8,
  "power": ["7kW", "22kW", "60kW", "120kW"],
  "price": 1.8,
  "hours": "00:00-24:00",
  "features": ["24小时营业", "免费停车"],
  "operator": "大众汽车充电服务"
}
```

### 自定义地图样式
在 `src/config/amap.js` 中修改地图样式：

```javascript
export const mapThemes = {
  light: 'amap://styles/whitesmoke',
  dark: 'amap://styles/dark',
  // 添加更多主题
}
```

## 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 许可证

MIT License

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱: support@volkswagen-charging.com
- 官网: https://www.vw.com.cn