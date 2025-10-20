import { defineStore } from 'pinia'
import { stationAPI, utils } from '../api/stationService'

export const useStationStore = defineStore('station', {
  state: () => ({
    stations: [],
    currentStation: null,
    userLocation: null, // 用户位置 {latitude, longitude}
    filterOptions: {
      chargeType: 'all', // 'all', 'quick', 'slow'
      openStatus: 'all', // 'all', 1(营业), 0(暂停)
      brandType: 'all', // 'all', 1, 2, 3, 4, 5, 6
      sortBy: 'distance' // 'distance', 'price'
    },
    loading: false,
    error: null
  }),

  getters: {
    filteredStations: (state) => {
      console.log('filteredStations getter被调用:', {
        stations: state.stations.length,
        filterOptions: state.filterOptions
      })
      let result = [...state.stations]

      // 按充电类型筛选
      if (state.filterOptions.chargeType !== 'all') {
        if (state.filterOptions.chargeType === 'quick') {
          result = result.filter(station => station.quickChargeNum > 0)
        } else if (state.filterOptions.chargeType === 'slow') {
          result = result.filter(station => station.slowChargeNum > 0)
        }
      }

      // 按营业状态筛选
      if (state.filterOptions.openStatus !== 'all') {
        result = result.filter(station => 
          station.openStatus === parseInt(state.filterOptions.openStatus)
        )
      }

      // 按品牌类型筛选
      if (state.filterOptions.brandType !== 'all') {
        result = result.filter(station => 
          station.brandType === parseInt(state.filterOptions.brandType)
        )
      }

      // 排序
      if (state.filterOptions.sortBy === 'distance') {
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      } else if (state.filterOptions.sortBy === 'price') {
        result.sort((a, b) => (a.totalCostPrice || 0) - (b.totalCostPrice || 0))
      }

      console.log('filteredStations结果:', result.length)
      return result
    },

    getStationById: (state) => (id) => {
      return state.stations.find(station => station.stationId === id)
    }
  },

  actions: {
    async fetchStations() {
      this.loading = true
      this.error = null
      try {
        console.log('🚀 开始加载充电桩数据...')
        // 使用新的API服务
        const response = await stationAPI.getStations()
        console.log('📡 API响应:', response)
        this.stations = response.stationList || []
        console.log('✅ 充电桩数据加载成功:', this.stations.length, '个充电桩')
        console.log('📋 第一个充电桩:', this.stations[0])
        
        // 如果用户位置已设置，重新计算距离
        if (this.userLocation) {
          this.updateDistances()
        }
      } catch (error) {
        this.error = '加载充电桩数据失败'
        console.error('❌ Failed to fetch stations:', error)
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
        console.log('充电桩距离示例:', this.stations.slice(0, 3).map(s => `${s.stationName}: ${s.distance}km`))
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
          station.lat,
          station.lng
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
        chargeType: 'all',
        openStatus: 'all',
        brandType: 'all',
        sortBy: 'distance'
      }
    }
  }
})