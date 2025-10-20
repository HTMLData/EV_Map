import { defineStore } from 'pinia'

export const useChargeStore = defineStore('charge', {
  state: () => ({
    currentSession: null,
    chargeHistory: [],
    charging: false,
    chargeProgress: 0,
    chargeTime: 0, // 充电时间（秒）
    energyCharged: 0, // 已充电量（kWh）
    cost: 0, // 费用
    chargingSpeed: 0 // 充电速度（kWh/h）
  }),

  getters: {
    formattedChargeTime: (state) => {
      const hours = Math.floor(state.chargeTime / 3600)
      const minutes = Math.floor((state.chargeTime % 3600) / 60)
      const seconds = state.chargeTime % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    isCharging: (state) => state.charging
  },

  actions: {
    startCharging(station) {
      // 适配新数据结构
      const price = parseFloat(
        station.totalCostPrice !== undefined ? station.totalCostPrice : station.price
      )
      // 估算充电速度：优先用快充桩数量判断一个合理的功率，否则给出保守默认
      const estimatedSpeedKwh = Number.isFinite(price)
        ? (station.quickChargeNum && station.quickChargeNum > 0 ? 60 : 7)
        : (station.quickChargeNum && station.quickChargeNum > 0 ? 60 : 7)

      this.currentSession = {
        id: Date.now(),
        stationId: station.stationId || station.id,
        startTime: new Date(),
        stationName: station.stationName || station.name,
        pricePerKWh: Number.isFinite(price) ? price : 1.2
      }
      this.charging = true
      this.chargeProgress = 0
      this.chargeTime = 0
      this.energyCharged = 0
      this.cost = 0
      
      // 根据站点信息设置充电速度（模拟）
      this.chargingSpeed = estimatedSpeedKwh // kWh/h
    },

    updateChargingProgress() {
      if (!this.charging || !this.currentSession) return
      
      this.chargeTime++
      // 计算已充电量（kWh）
      this.energyCharged += this.chargingSpeed / 3600
      // 计算费用
      this.cost = this.energyCharged * this.currentSession.pricePerKWh
      // 更新充电进度（假设满充为100kWh）
      this.chargeProgress = Math.min((this.energyCharged / 100) * 100, 100)
    },

    stopCharging() {
      if (!this.charging || !this.currentSession) return
      
      this.charging = false
      this.currentSession.endTime = new Date()
      this.currentSession.totalEnergy = this.energyCharged
      this.currentSession.totalCost = this.cost
      
      // 添加到历史记录
      this.chargeHistory.push({ ...this.currentSession })
      
      return this.currentSession
    },

    resetSession() {
      this.currentSession = null
      this.charging = false
      this.chargeProgress = 0
      this.chargeTime = 0
      this.energyCharged = 0
      this.cost = 0
      this.chargingSpeed = 0
    },

    completePayment(sessionId) {
      const session = this.chargeHistory.find(s => s.id === sessionId)
      if (session) {
        session.paid = true
        session.paymentTime = new Date()
        return true
      }
      return false
    }
  }
})