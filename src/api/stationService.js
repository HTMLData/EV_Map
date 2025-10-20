import axios from 'axios'

// API 基础配置
const API_BASE_URL = '/api'
const MOCK_BASE_URL = '/mock'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Mock 数据客户端
const mockClient = axios.create({
  baseURL: MOCK_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Mock客户端响应拦截器
mockClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('Mock数据请求错误:', error)
    return Promise.reject(error)
  }
)

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token等
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 充电桩相关API
export const stationAPI = {
  // 获取充电桩列表
  async getStations(params = {}) {
    try {
      console.log('🔍 尝试调用真实API...')
      // 优先使用真实API，失败时回退到mock数据
      const response = await apiClient.get('/stations', { params })
      
      // 检查响应是否为HTML（说明API不存在）
      if (typeof response === 'string' && response.includes('<!doctype html>')) {
        throw new Error('API返回HTML页面，说明API不存在')
      }
      
      console.log('✅ 真实API调用成功:', response)
      return response
    } catch (error) {
      console.warn('⚠️ 真实API不可用，使用mock数据:', error.message)
      console.log('📡 开始调用Mock API...')
      const response = await mockClient.get('/stationList.json')
      console.log('📦 Mock API响应:', response)
      return response
    }
  },

  // 获取充电桩详情
  async getStationDetail(stationId) {
    try {
      const response = await apiClient.get(`/stations/${stationId}`)
      if (typeof response === 'string' && response.includes('<!doctype html>')) {
        throw new Error('API返回HTML页面，说明API不存在')
      }
      return response
    } catch (error) {
      console.warn('真实API不可用，使用mock数据:', error.message)
      // 从mock数据中查找对应ID的充电桩
      const response = await mockClient.get(`/stationDetail.json?t=${Date.now()}`)
      const station = response.stationDetails.find(s => String(s.stationId) === String(stationId))
      if (station) {
        return station
      }
      throw new Error('充电桩不存在')
    }
  },

  // 搜索充电桩
  async searchStations(query, filters = {}) {
    try {
      const response = await apiClient.get('/stations/search', {
        params: { query, ...filters }
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，使用mock数据:', error.message)
      const response = await mockClient.get('/stationList.json')
      let results = response.stationList || []
      
      // 简单的客户端搜索
      if (query) {
        const searchTerm = query.toLowerCase()
        results = results.filter(station => 
          station.stationName.toLowerCase().includes(searchTerm) ||
          station.address.toLowerCase().includes(searchTerm) ||
          station.brandName.toLowerCase().includes(searchTerm)
        )
      }
      
      // 应用筛选条件
      if (filters.brandType && filters.brandType !== 'all') {
        results = results.filter(station => 
          station.brandType === parseInt(filters.brandType)
        )
      }
      
      if (filters.openStatus !== undefined && filters.openStatus !== 'all') {
        results = results.filter(station => 
          station.openStatus === parseInt(filters.openStatus)
        )
      }

      // 快充/慢充筛选
      if (filters.chargeType === 'quick') {
        results = results.filter(station => station.quickChargeNum > 0)
      } else if (filters.chargeType === 'slow') {
        results = results.filter(station => station.slowChargeNum > 0)
      }
      
      return {
        stationList: results,
        total: results.length,
        pageIndex: 1,
        pageSize: results.length
      }
    }
  },

  // 获取附近的充电桩
  async getNearbyStations(latitude, longitude, radius = 10) {
    try {
      const response = await apiClient.get('/stations/nearby', {
        params: { latitude, longitude, radius }
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，使用mock数据:', error.message)
      const response = await mockClient.get('/stationList.json')
      let stations = response.stationList || []
      
      // 计算距离并筛选
      stations = stations.map(station => {
        const distance = utils.calculateDistanceByAMap(
          latitude, longitude,
          station.lat, station.lng
        )
        return {
          ...station,
          distance: Math.round(distance * 10) / 10
        }
      })
      
      // 按距离排序
      stations.sort((a, b) => a.distance - b.distance)
      
      return {
        stationList: stations,
        total: stations.length,
        pageIndex: 1,
        pageSize: stations.length
      }
    }
  }
}

// 用户相关API
export const userAPI = {
  // 获取用户位置
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
          },
          (error) => {
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      } else {
        reject(new Error('浏览器不支持定位功能'))
      }
    })
  },

  // 保存用户偏好设置
  async saveUserPreferences(preferences) {
    try {
      const response = await apiClient.post('/user/preferences', preferences)
      return response
    } catch (error) {
      console.warn('保存用户偏好失败:', error.message)
      // 保存到本地存储
      localStorage.setItem('user_preferences', JSON.stringify(preferences))
      return preferences
    }
  },

  // 获取用户偏好设置
  async getUserPreferences() {
    try {
      const response = await apiClient.get('/user/preferences')
      return response
    } catch (error) {
      console.warn('获取用户偏好失败，使用本地存储:', error.message)
      const preferences = localStorage.getItem('user_preferences')
      return preferences ? JSON.parse(preferences) : {}
    }
  }
}

// 充电会话相关API
export const chargeAPI = {
  // 开始充电
  async startCharging(stationId, connectorId, userId) {
    try {
      const response = await apiClient.post('/charge/start', {
        stationId,
        connectorId,
        userId,
        startTime: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，模拟充电开始:', error.message)
      return {
        sessionId: Date.now(),
        stationId,
        connectorId,
        userId,
        startTime: new Date().toISOString(),
        status: 'charging'
      }
    }
  },

  // 结束充电
  async stopCharging(sessionId) {
    try {
      const response = await apiClient.post(`/charge/${sessionId}/stop`, {
        endTime: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，模拟充电结束:', error.message)
      return {
        sessionId,
        endTime: new Date().toISOString(),
        status: 'completed',
        totalCost: Math.random() * 50 + 10 // 模拟费用
      }
    }
  },

  // 获取充电状态
  async getChargeStatus(sessionId) {
    try {
      const response = await apiClient.get(`/charge/${sessionId}/status`)
      return response
    } catch (error) {
      console.warn('真实API不可用，模拟充电状态:', error.message)
      return {
        sessionId,
        status: 'charging',
        currentPower: Math.random() * 50 + 10,
        energyCharged: Math.random() * 30 + 5,
        estimatedTimeRemaining: Math.random() * 60 + 10
      }
    }
  }
}

// 支付相关API
export const paymentAPI = {
  // 创建支付订单
  async createPaymentOrder(chargeSession) {
    try {
      const response = await apiClient.post('/payment/create', {
        sessionId: chargeSession.sessionId,
        amount: chargeSession.totalCost,
        currency: 'CNY'
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，模拟支付订单创建:', error.message)
      return {
        orderId: Date.now(),
        sessionId: chargeSession.sessionId,
        amount: chargeSession.totalCost,
        currency: 'CNY',
        status: 'pending'
      }
    }
  },

  // 处理支付
  async processPayment(orderId, paymentMethod) {
    try {
      const response = await apiClient.post(`/payment/${orderId}/process`, {
        paymentMethod,
        timestamp: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，模拟支付处理:', error.message)
      return {
        orderId,
        status: 'success',
        transactionId: Date.now(),
        paidAt: new Date().toISOString()
      }
    }
  }
}

// 导航相关API
export const navigationAPI = {
  // 获取路线规划
  async getRoute(from, to, options = {}) {
    try {
      const response = await apiClient.post('/navigation/route', {
        from,
        to,
        ...options
      })
      return response
    } catch (error) {
      console.warn('真实API不可用，使用高德地图API:', error.message)
      // 这里可以集成高德地图的路线规划API
      return {
        distance: Math.random() * 20 + 1,
        duration: Math.random() * 60 + 10,
        route: []
      }
    }
  }
}

// 工具函数
export const utils = {
  // 使用高德地图API计算两点间距离（推荐方法）
  calculateDistanceByAMap(lat1, lon1, lat2, lon2) {
    // 检查高德地图API是否可用
    if (window.AMap && window.AMap.GeometryUtil) {
      try {
        // 使用高德地图的几何计算工具
        const point1 = new window.AMap.LngLat(lon1, lat1)
        const point2 = new window.AMap.LngLat(lon2, lat2)
        
        // 计算直线距离（米）
        const distance = window.AMap.GeometryUtil.distance(point1, point2)
        
        // 转换为公里
        return distance / 1000
      } catch (error) {
        console.warn('高德地图距离计算失败，使用备用方法:', error)
        return this.calculateDistanceHaversine(lat1, lon1, lat2, lon2)
      }
    } else {
      console.warn('高德地图API未加载，使用备用距离计算方法')
      return this.calculateDistanceHaversine(lat1, lon1, lat2, lon2)
    }
  },

  // 使用高德地图API计算多个点到用户位置的距离
  calculateDistancesToUser(userLat, userLon, stations) {
    if (!userLat || !userLon) {
      console.warn('用户位置信息不完整')
      return stations
    }

    return stations.map(station => {
      const distance = this.calculateDistanceByAMap(
        userLat, 
        userLon, 
        station.lat, 
        station.lng
      )
      
      return {
        ...station,
        distance: Math.round(distance * 10) / 10 // 保留一位小数
      }
    })
  },

  // 备用距离计算方法（Haversine公式）
  calculateDistanceHaversine(lat1, lon1, lat2, lon2) {
    const R = 6371 // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  },

  // 计算两点间距离（保持向后兼容）
  calculateDistance(lat1, lon1, lat2, lon2) {
    return this.calculateDistanceByAMap(lat1, lon1, lat2, lon2)
  },

  // 格式化价格
  formatPrice(price) {
    return `¥${price.toFixed(2)}`
  },

  // 格式化距离
  formatDistance(distance) {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`
    }
    return `${distance.toFixed(1)}km`
  },

  // 格式化时间
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes.toFixed(0)}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins > 0 ? mins.toFixed(0) + '分钟' : ''}`
  },

  // 格式化充电枪状态
  formatConnectorStatus(status) {
    const statusMap = {
      0: { text: '离网', color: '#999' },
      1: { text: '空闲', color: '#52c41a' },
      2: { text: '占用(未充电)', color: '#faad14' },
      3: { text: '占用(充电中)', color: '#1890ff' },
      4: { text: '占用(预约锁定)', color: '#722ed1' },
      255: { text: '故障', color: '#ff4d4f' }
    }
    return statusMap[status] || { text: '未知', color: '#999' }
  },

  // 格式化营业状态
  formatOpenStatus(status) {
    return status === 1 ? '营业中' : '暂停营业'
  },

  // 格式化品牌类型
  formatBrandType(type) {
    const typeMap = {
      1: '大众汽车充电服务',
      2: '万达充电',
      3: '绿色校园',
      4: '机场服务集团',
      5: '政务充电',
      6: '星星充电'
    }
    return typeMap[type] || '未知品牌'
  }
}

export default {
  stationAPI,
  userAPI,
  chargeAPI,
  paymentAPI,
  navigationAPI,
  utils
}
