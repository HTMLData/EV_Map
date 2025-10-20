// 高德地图配置
// 包含API密钥、安全密钥、地图选项、控件配置等
export const amapConfig = {
  // 高德地图API Key - 请替换为您的实际API Key
  // 备用密钥列表，如果主密钥失败会自动尝试
  keys: [
    'b70f45ee3b78048c357c21a2cbaf8ad8', // 主密钥
    'your_backup_key_here', // 备用密钥1
    'your_backup_key_2'     // 备用密钥2
  ],
  key: 'b70f45ee3b78048c357c21a2cbaf8ad8', // 当前使用的密钥
  
  // 安全密钥 - 用于解决INVALID_USER_SCODE错误
  // 在高德地图控制台 -> 应用管理 -> 我的应用 -> 安全密钥 中获取
  securityJsCode: '7261623dfd645a84b51251861dc7eeed', // 您的安全密钥
  
  // 域名白名单配置 - 解决INVALID_USER_SCODE问题
  // 确保高德地图控制台中的域名白名单包含以下域名
  allowedDomains: [
    'localhost:3000',
    'localhost:3001', 
    'localhost:3002',
    '127.0.0.1:3000',
    '127.0.0.1:3001',
    '127.0.0.1:3002'
  ],
  
  // API版本
  version: '2.0',
  
  // 默认地图配置
  defaultMapOptions: {
    center: [116.405467, 39.907761], // 北京坐标
    zoom: 13,
    viewMode: '2D',
    mapStyle: 'amap://styles/whitesmoke',
    showBuildingBlock: false,
    showIndoorMap: false,
    showLabel: true
  },
  
  // 控件配置
  controls: {
    // 缩放控件
    toolbar: {
      position: 'RB', // 右下角
      showZoomNum: true,
      offset: [20, 20]
    },
    
    // 比例尺控件
    scale: {
      position: 'LB' // 左下角
    },
    
    // 控制罗盘
    controlBar: {
      position: 'TR', // 右上角
      showZoomBar: false,
      showControlButton: true,
      // 指南针大小调整为50%
      offset: [20, 20]
    },
    
    // 图层切换
    mapType: {
      position: 'RT', // 右上角
      defaultType: 0,
      showTraffic: false,
      showRoad: false
    }
  },
  
  // 标记点配置
  markers: {
    // 充电桩标记
    station: {
      size: [36, 36],
      imageSize: [36, 36]
    },
    
    // 用户位置标记
    user: {
      size: [28.8, 28.8],
      imageSize: [28.8, 28.8]
    }
  },
  
  // 信息窗口配置
  infoWindow: {
    offset: [0, -30],
    maxWidth: 300
  },
  
  // 定位配置
  geolocation: {
    enableHighAccuracy: true,
    timeout: 10000,
    showButton: false,
    showMarker: false,
    showCircle: false,
    panToLocation: false,
    extensions: 'all'
  },
  
  // 路线规划配置
  driving: {
    autoFitView: true,
    showTraffic: false,
    hideMarkers: false
  }
}

// 地图样式主题
export const mapThemes = {
  light: 'amap://styles/whitesmoke',
  dark: 'amap://styles/dark',
  normal: 'amap://styles/normal',
  fresh: 'amap://styles/fresh'
}

// 充电桩状态颜色配置
export const statusColors = {
  '空闲': '#52c41a',
  '部分空闲': '#faad14', 
  '繁忙': '#f5222d',
  '维护中': '#888'
}

// 充电桩类型配置
export const chargeTypes = {
  '快充': {
    color: '#1890ff',
    icon: 'fast-charge'
  },
  '慢充': {
    color: '#52c41a',
    icon: 'slow-charge'
  }
}

// 地图事件配置
export const mapEvents = {
  // 地图加载完成
  complete: 'complete',
  
  // 地图错误
  error: 'error',
  
  // 标记点击
  markerClick: 'click',
  
  // 地图点击
  mapClick: 'click',
  
  // 地图移动
  mapMove: 'moveend',
  
  // 地图缩放
  mapZoom: 'zoomchange'
}

export default amapConfig
