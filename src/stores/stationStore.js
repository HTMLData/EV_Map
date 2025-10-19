import { defineStore } from 'pinia'
import axios from 'axios'
import { utils } from '../api/mockService'

// 直接定义mock数据，避免导入问题
const stationsData = [
  {
    "id": 1,
    "name": "大众汽车充电中心",
    "address": "北京市朝阳区建国路88号",
    "latitude": 39.9087,
    "longitude": 116.4668,
    "type": ["快充", "慢充"],
    "status": "空闲",
    "totalPorts": 12,
    "availablePorts": 8,
    "power": ["7kW", "22kW", "60kW", "120kW"],
    "price": 1.8,
    "hours": "00:00-24:00",
    "features": ["24小时营业", "免费停车", "休息室", "WiFi"],
    "operator": "大众汽车服务"
  },
  {
    "id": 2,
    "name": "朝阳公园充电站",
    "address": "北京市朝阳区朝阳公园南路1号",
    "latitude": 39.9293,
    "longitude": 116.4823,
    "type": ["快充"],
    "status": "部分空闲",
    "totalPorts": 8,
    "availablePorts": 3,
    "power": ["60kW", "120kW"],
    "price": 1.95,
    "hours": "08:00-22:00",
    "features": ["停车场内", "监控", "充电桩状态显示"],
    "operator": "城市充电联盟"
  },
  {
    "id": 3,
    "name": "望京SOHO充电站",
    "address": "北京市朝阳区望京SOHO T1地下停车场",
    "latitude": 39.9974,
    "longitude": 116.4778,
    "type": ["快充", "慢充"],
    "status": "空闲",
    "totalPorts": 16,
    "availablePorts": 12,
    "power": ["7kW", "22kW", "60kW"],
    "price": 2.0,
    "hours": "全天开放",
    "features": ["智能预约", "APP支付", "车位引导"],
    "operator": "大众汽车充电服务"
  },
  {
    "id": 4,
    "name": "三里屯太古里充电站",
    "address": "北京市朝阳区三里屯路19号",
    "latitude": 39.9372,
    "longitude": 116.4551,
    "type": ["快充"],
    "status": "繁忙",
    "totalPorts": 6,
    "availablePorts": 1,
    "power": ["120kW"],
    "price": 2.2,
    "hours": "10:00-22:00",
    "features": ["商场内", "高端环境", "专人引导"],
    "operator": "星星充电"
  },
  {
    "id": 5,
    "name": "北京南站充电站",
    "address": "北京市丰台区车站路12号",
    "latitude": 39.8659,
    "longitude": 116.3778,
    "type": ["快充", "慢充"],
    "status": "部分空闲",
    "totalPorts": 20,
    "availablePorts": 7,
    "power": ["7kW", "22kW", "60kW", "120kW"],
    "price": 1.85,
    "hours": "全天开放",
    "features": ["火车站内", "24小时监控", "多品牌兼容"],
    "operator": "国家电网"
  },
  {
    "id": 6,
    "name": "奥林匹克公园充电站",
    "address": "北京市朝阳区天辰东路11号",
    "latitude": 39.9997,
    "longitude": 116.3917,
    "type": ["慢充"],
    "status": "空闲",
    "totalPorts": 10,
    "availablePorts": 10,
    "power": ["7kW", "22kW"],
    "price": 1.7,
    "hours": "06:00-22:00",
    "features": ["公园内", "环境优美", "适合长时充电"],
    "operator": "绿色出行"
  },
  {
    "id": 7,
    "name": "中关村软件园充电站",
    "address": "北京市海淀区中关村软件园二期",
    "latitude": 40.0538,
    "longitude": 116.2973,
    "type": ["快充", "慢充"],
    "status": "部分空闲",
    "totalPorts": 24,
    "availablePorts": 10,
    "power": ["7kW", "22kW", "60kW", "120kW"],
    "price": 1.9,
    "hours": "全天开放",
    "features": ["科技园区", "快充为主", "员工专享优惠"],
    "operator": "科技充电"
  },
  {
    "id": 8,
    "name": "首都机场T3充电站",
    "address": "北京市顺义区首都机场T3航站楼停车场",
    "latitude": 40.0799,
    "longitude": 116.6027,
    "type": ["快充"],
    "status": "空闲",
    "totalPorts": 15,
    "availablePorts": 12,
    "power": ["60kW", "120kW"],
    "price": 2.1,
    "hours": "全天开放",
    "features": ["机场内", "长途出行首选", "快速补电"],
    "operator": "机场服务集团"
  },
  {
    "id": 9,
    "name": "合肥南站充电中心",
    "address": "安徽省合肥市包河区合肥南站地下停车场",
    "latitude": 31.7849,
    "longitude": 117.2272,
    "type": ["快充", "慢充"],
    "status": "部分空闲",
    "totalPorts": 20,
    "availablePorts": 8,
    "power": ["7kW", "22kW", "60kW", "120kW"],
    "price": 1.75,
    "hours": "全天开放",
    "features": ["高铁站内", "24小时监控", "多品牌兼容", "休息区"],
    "operator": "大众汽车充电服务"
  },
  {
    "id": 10,
    "name": "天鹅湖万达充电站",
    "address": "安徽省合肥市蜀山区天鹅湖万达广场地下停车场",
    "latitude": 31.8209,
    "longitude": 117.2262,
    "type": ["快充"],
    "status": "空闲",
    "totalPorts": 12,
    "availablePorts": 10,
    "power": ["60kW", "120kW"],
    "price": 1.9,
    "hours": "08:00-22:00",
    "features": ["商场内", "购物充电", "停车优惠", "WiFi"],
    "operator": "万达充电"
  },
  {
    "id": 11,
    "name": "合肥工业大学充电站",
    "address": "安徽省合肥市包河区屯溪路193号合肥工业大学",
    "latitude": 31.8631,
    "longitude": 117.2806,
    "type": ["慢充"],
    "status": "空闲",
    "totalPorts": 8,
    "availablePorts": 8,
    "power": ["7kW", "22kW"],
    "price": 1.6,
    "hours": "06:00-23:00",
    "features": ["校园内", "环境优美", "适合长时充电", "学生优惠"],
    "operator": "绿色校园"
  },
  {
    "id": 12,
    "name": "滨湖新区充电站",
    "address": "安徽省合肥市包河区滨湖新区徽州大道与紫云路交叉口",
    "latitude": 31.7409,
    "longitude": 117.3062,
    "type": ["快充", "慢充"],
    "status": "繁忙",
    "totalPorts": 16,
    "availablePorts": 2,
    "power": ["7kW", "22kW", "60kW", "120kW"],
    "price": 1.85,
    "hours": "全天开放",
    "features": ["新区核心", "智能预约", "APP支付", "车位引导"],
    "operator": "大众汽车充电服务"
  },
  {
    "id": 13,
    "name": "合肥新桥国际机场充电站",
    "address": "安徽省合肥市蜀山区合肥新桥国际机场停车场",
    "latitude": 31.9889,
    "longitude": 116.9782,
    "type": ["快充"],
    "status": "空闲",
    "totalPorts": 18,
    "availablePorts": 15,
    "power": ["60kW", "120kW"],
    "price": 2.0,
    "hours": "全天开放",
    "features": ["机场内", "长途出行首选", "快速补电", "24小时服务"],
    "operator": "机场服务集团"
  },
  {
    "id": 14,
    "name": "政务区充电中心",
    "address": "安徽省合肥市蜀山区政务区潜山路与习友路交叉口",
    "latitude": 31.8209,
    "longitude": 117.2262,
    "type": ["快充", "慢充"],
    "status": "部分空闲",
    "totalPorts": 24,
    "availablePorts": 12,
    "power": ["7kW", "22kW", "60kW", "120kW"],
    "price": 1.8,
    "hours": "全天开放",
    "features": ["政务区核心", "高端环境", "专人引导", "休息室"],
    "operator": "政务充电"
  },
  {
    "id": 15,
    "name": "瑶海万达充电站",
    "address": "安徽省合肥市瑶海区瑶海万达广场地下停车场",
    "latitude": 31.8631,
    "longitude": 117.3206,
    "type": ["快充"],
    "status": "空闲",
    "totalPorts": 10,
    "availablePorts": 9,
    "power": ["60kW", "120kW"],
    "price": 1.9,
    "hours": "08:00-22:00",
    "features": ["商场内", "购物充电", "停车优惠", "监控"],
    "operator": "万达充电"
  }
]

export const useStationStore = defineStore('station', {
  state: () => ({
    stations: [],
    currentStation: null,
    userLocation: null, // 用户位置 {latitude, longitude}
    filterOptions: {
      type: 'all', // 'all', '快充', '慢充'
      status: 'all', // 'all', '空闲', '部分空闲', '繁忙'
      sortBy: 'distance' // 'distance', 'price'
    },
    loading: false,
    error: null
  }),

  getters: {
    filteredStations: (state) => {
      let result = [...state.stations]

      // 按类型筛选
      if (state.filterOptions.type !== 'all') {
        result = result.filter(station => 
          station.type.includes(state.filterOptions.type)
        )
      }

      // 按状态筛选
      if (state.filterOptions.status !== 'all') {
        result = result.filter(station => 
          station.status === state.filterOptions.status
        )
      }

      // 排序
      if (state.filterOptions.sortBy === 'distance') {
        result.sort((a, b) => a.distance - b.distance)
      } else if (state.filterOptions.sortBy === 'price') {
        result.sort((a, b) => a.price - b.price)
      }

      return result
    },

    getStationById: (state) => (id) => {
      return state.stations.find(station => station.id === parseInt(id))
    }
  },

  actions: {
    async fetchStations() {
      this.loading = true
      this.error = null
      try {
        // 直接使用导入的mock数据
        this.stations = stationsData
        console.log('充电桩数据加载成功:', this.stations.length, '个充电桩')
        
        // 如果用户位置已设置，重新计算距离
        if (this.userLocation) {
          this.updateDistances()
        }
      } catch (error) {
        this.error = '加载充电桩数据失败'
        console.error('Failed to fetch stations:', error)
      } finally {
        this.loading = false
      }
    },

    // 设置用户位置并更新所有充电桩的距离
    setUserLocation(latitude, longitude) {
      this.userLocation = { latitude, longitude }
      console.log('用户位置已设置:', latitude, longitude)
      
      // 更新所有充电桩的距离
      this.updateDistances()
    },

    // 更新所有充电桩到用户的距离（只在定位时计算一次）
    updateDistances() {
      if (!this.userLocation) {
        console.warn('用户位置未设置，无法计算距离')
        return
      }

      try {
        // 使用高德地图API计算距离
        this.stations = utils.calculateDistancesToUser(
          this.userLocation.latitude,
          this.userLocation.longitude,
          this.stations
        )
        
        console.log('距离计算完成，已更新所有充电桩距离')
        console.log('充电桩距离示例:', this.stations.slice(0, 3).map(s => `${s.name}: ${s.distance}km`))
      } catch (error) {
        console.error('距离计算失败:', error)
      }
    },

    // 计算单个充电桩到用户的距离
    calculateStationDistance(station) {
      if (!this.userLocation) {
        return station.distance || 0
      }

      try {
        return utils.calculateDistanceByAMap(
          this.userLocation.latitude,
          this.userLocation.longitude,
          station.latitude,
          station.longitude
        )
      } catch (error) {
        console.error('单个距离计算失败:', error)
        return station.distance || 0
      }
    },

    setCurrentStation(station) {
      this.currentStation = station
    },

    updateFilter(type, value) {
      this.filterOptions[type] = value
    },

    resetFilters() {
      this.filterOptions = {
        type: 'all',
        status: 'all',
        sortBy: 'distance'
      }
    }
  }
})