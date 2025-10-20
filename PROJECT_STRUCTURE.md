# 项目文件结构说明

## 📁 项目文件结构

```
EV_Map/
├── 📄 README.md                    # 项目主文档（已整合所有说明）
├── 📄 package.json                  # 项目配置和依赖
├── 📄 vite.config.js               # Vite 构建配置（支持 HTTPS）
├── 📄 docker-compose.yml           # Docker Compose 配置
├── 📄 Dockerfile                   # Docker 镜像配置
├── 📄 .gitignore                   # Git 忽略文件配置
│
├── 📁 src/                         # 源代码目录
│   ├── 📁 api/                     # API 服务层
│   ├── 📁 components/              # Vue 组件
│   ├── 📁 config/                  # 配置文件
│   ├── 📁 stores/                  # Pinia 状态管理
│   ├── 📁 views/                   # 页面组件
│   ├── 📁 router/                  # 路由配置
│   ├── 📄 App.vue                  # 根组件
│   └── 📄 main.js                  # 入口文件
│
├── 📁 mock/                        # Mock 数据
│   └── 📄 stations.json            # 充电桩数据
│
├── 📁 public/                      # 静态资源
│   ├── 📄 index.html              # HTML 模板
│   └── 📁 assets/                 # 静态资源
│
├── 📁 certs/                       # SSL 证书目录（自动生成）
│   ├── 📄 localhost.pem           # SSL 证书
│   └── 📄 localhost-key.pem        # SSL 私钥
│
├── 📁 scripts/                     # 脚本目录
│   └── 📄 generate-certs.cjs      # 跨平台证书生成脚本
│
├── 📁 dist/                        # 构建输出目录（自动生成）
│
└── 🚀 启动脚本
    ├── 📄 quick-start.sh          # macOS/Linux 快速启动
    ├── 📄 quick-start.bat          # Windows 快速启动
    ├── 📄 generate-certs.sh        # macOS/Linux 证书生成
    ├── 📄 generate-certs.bat       # Windows 证书生成
    ├── 📄 generate-certs-enhanced.bat # Windows 增强版证书生成
    ├── 📄 deploy.sh                # macOS/Linux 部署脚本
    ├── 📄 deploy.bat               # Windows 部署脚本
    └── 📄 start-http.bat           # Windows HTTP 模式启动
```

## 🚀 快速启动命令

### 一键启动（推荐）
```bash
# 自动检测系统并启动
npm run quick-start

# 或直接运行脚本
# macOS/Linux
./quick-start.sh

# Windows
quick-start.bat
```

### 手动启动
```bash
# 1. 安装依赖
npm install

# 2. 生成证书
npm run generate-certs

# 3. 启动 HTTPS 服务
npm run dev:https
```

## 📋 文件说明

### 核心文件
- **README.md**: 完整的项目文档，包含所有部署说明
- **package.json**: 项目配置，包含所有 npm 脚本
- **vite.config.js**: 构建配置，支持 HTTPS 和跨平台

### 启动脚本
- **quick-start.sh/bat**: 一键启动脚本，自动检测环境
- **generate-certs.sh/bat**: 证书生成脚本
- **deploy.sh/bat**: 部署脚本，支持开发/生产/Docker

### 配置文件
- **docker-compose.yml**: Docker Compose 配置
- **Dockerfile**: Docker 镜像配置
- **nginx-https.conf**: Nginx HTTPS 配置示例

### 目录说明
- **src/**: 源代码，包含所有 Vue 组件和业务逻辑
- **mock/**: Mock 数据，用于开发和测试
- **certs/**: SSL 证书，自动生成
- **dist/**: 构建输出，生产环境文件
- **scripts/**: 工具脚本，跨平台兼容

## 🔧 维护说明

### 添加新功能
1. 在 `src/` 目录下添加新组件
2. 更新 `src/router/index.js` 添加路由
3. 更新 `src/stores/` 添加状态管理

### 更新依赖
```bash
# 更新依赖
npm update

# 清理缓存
npm run clean
```

### 部署更新
```bash
# 构建新版本
npm run build

# Docker 部署
docker-compose up -d --build
```

## 📝 注意事项

1. **证书文件**: `certs/` 目录下的文件不要提交到 Git
2. **环境变量**: 生产环境需要配置真实的高德地图 API Key
3. **端口冲突**: 确保端口 3000 和 4173 未被占用
4. **防火墙**: 确保防火墙允许相应端口访问
5. **HTTPS**: 生产环境建议使用真实的 SSL 证书
