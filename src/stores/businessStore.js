import { defineStore } from 'pinia'

export const useBusinessStore = defineStore('business', {
  state: () => ({
    currentFlow: null, // 当前业务流程: 'find' | 'navigate' | 'charge' | 'pay'
    selectedStation: null, // 当前选中的充电桩
    navigationTarget: null, // 导航目标
    chargeSession: null, // 当前充电会话
    paymentSession: null, // 当前支付会话
    flowHistory: [] // 业务流程历史
  }),

  getters: {
    isInFlow: (state) => state.currentFlow !== null,
    canStartCharging: (state) => state.selectedStation && state.selectedStation.status !== '繁忙',
    hasActiveSession: (state) => state.chargeSession !== null
  },

  actions: {
    // 开始查找充电桩流程
    startFindFlow() {
      this.currentFlow = 'find'
      this.selectedStation = null
      this.navigationTarget = null
      this.chargeSession = null
      this.paymentSession = null
    },

    // 选择充电桩
    selectStation(station) {
      this.selectedStation = station
      this.currentFlow = 'navigate'
    },

    // 开始导航
    startNavigation(stationId) {
      const station = this.selectedStation
      if (station && station.id === stationId) {
        this.navigationTarget = station
        this.currentFlow = 'navigate'
      }
    },

    // 开始充电
    startCharging(station) {
      this.selectedStation = station
      this.chargeSession = {
        id: Date.now(),
        stationId: station.id,
        stationName: station.name,
        startTime: new Date(),
        status: 'charging'
      }
      this.currentFlow = 'charge'
    },

    // 结束充电
    finishCharging(sessionData) {
      if (this.chargeSession) {
        this.chargeSession = {
          ...this.chargeSession,
          ...sessionData,
          endTime: new Date(),
          status: 'completed'
        }
        this.paymentSession = { ...this.chargeSession }
        this.currentFlow = 'pay'
      }
    },

    // 完成支付
    completePayment() {
      if (this.paymentSession) {
        this.paymentSession.paid = true
        this.paymentSession.paymentTime = new Date()
        
        // 记录到历史
        this.flowHistory.push({
          id: this.paymentSession.id,
          station: this.selectedStation,
          session: this.paymentSession,
          completedAt: new Date()
        })
        
        // 重置状态
        this.resetFlow()
      }
    },

    // 重置业务流程
    resetFlow() {
      this.currentFlow = null
      this.selectedStation = null
      this.navigationTarget = null
      this.chargeSession = null
      this.paymentSession = null
    },

    // 获取历史记录
    getHistory() {
      return this.flowHistory
    }
  }
})
