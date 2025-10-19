<template>
  <div class="volkswagen-charge-container">
    <!-- 大众风格的顶部导航栏 -->
    <div class="volkswagen-header">
      <div class="header-left">
        <div class="back-button" @click="goBack">
          <CustomIcon name="clear-route" :size="20" color="#081c54" />
        </div>
        <div class="logo">
          <span class="logo-text">VOLKSWAGEN</span>
          <span class="logo-subtitle">充电网络</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 充电状态卡片 -->
      <div class="volkswagen-station-card">
        <div class="station-header">
          <h1 class="station-title">充电中</h1>
          <div class="status-badge charging-status">
            充电中
          </div>
        </div>
        <p class="address">{{ station?.name }}</p>
      </div>

      <!-- 充电进度 -->
      <div class="volkswagen-section">
        <h2 class="section-title">充电进度</h2>
        <div class="progress-section">
          <div class="progress-ring">
            <svg width="200" height="200" viewBox="0 0 100 100">
              <!-- 背景圆环 -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f0f0f0"
                stroke-width="8"
              />
              <!-- 进度圆环 -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#081c54"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="circumference - (chargeStore.chargeProgress / 100) * circumference"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="progress-content">
              <div class="progress-text">{{ Math.round(chargeStore.chargeProgress) }}%</div>
              <div class="energy-text">{{ chargeStore.energyCharged.toFixed(2) }}kWh</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 充电信息 -->
      <div class="volkswagen-section">
        <h2 class="section-title">充电信息</h2>
        <div class="device-info">
          <div class="device-item">
            <span class="label">充电时间</span>
            <span class="value">{{ chargeStore.formattedChargeTime }}</span>
          </div>
          <div class="device-item">
            <span class="label">充电功率</span>
            <span class="value">{{ chargeStore.chargingSpeed.toFixed(1) }}kW</span>
          </div>
          <div class="device-item">
            <span class="label">预计费用</span>
            <span class="value price">¥{{ chargeStore.cost.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 充电提示 -->
      <div class="volkswagen-section">
        <h2 class="section-title">充电提示</h2>
        <div class="features">
          <div class="feature-item">
            <CustomIcon name="charging-station" :size="16" color="#081c54" />
            <span>请勿在充电过程中拔下充电枪</span>
          </div>
          <div class="feature-item">
            <CustomIcon name="charging-station" :size="16" color="#081c54" />
            <span>建议充电至80%以保护电池寿命</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 充电状态动画 -->
    <div class="charging-animation">
      <div class="pulse-ring"></div>
      <div class="charging-icon">
        <van-icon name="flash" size="48" color="#1989fa" />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="volkswagen-bottom-actions">
      <button class="volkswagen-btn primary-btn" @click="showStopConfirm = true">
        <CustomIcon name="charging-station" :size="18" color="#fff" />
        <span>结束充电</span>
      </button>
    </div>

    <!-- 结束充电确认弹窗 -->
    <van-dialog
      v-model:show="showStopConfirm"
      title="结束充电"
      show-cancel-button
      confirm-button-text="确认结束"
      cancel-button-text="继续充电"
      @confirm="stopCharging"
    >
      <p>确定要结束当前充电吗？</p>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStationStore } from '../stores/stationStore'
import { useChargeStore } from '../stores/chargeStore'
import { useBusinessStore } from '../stores/businessStore'
import CustomIcon from '../components/CustomIcon.vue'
// Vant 组件已在 main.js 中全局注册

const route = useRoute()
const router = useRouter()
const stationStore = useStationStore()
const chargeStore = useChargeStore()
const businessStore = useBusinessStore()

let station = ref(null)
let timer = null
const showStopConfirm = ref(false)

// 计算圆环周长
const circumference = computed(() => 2 * Math.PI * 45)

// 初始化充电会话
const initChargeSession = async () => {
  const id = route.params.id
  
  // 确保数据已加载
  if (stationStore.stations.length === 0) {
    await stationStore.fetchStations()
  }
  
  station.value = stationStore.getStationById(id)
  
  if (!station.value) {
    router.replace('/')
    return
  }
  
  // 开始充电
  if (!chargeStore.isCharging) {
    chargeStore.startCharging(station.value)
  }
}

// 启动定时器更新充电进度
const startTimer = () => {
  timer = setInterval(() => {
    if (chargeStore.isCharging) {
      chargeStore.updateChargingProgress()
      
      // 如果充电进度达到100%，自动结束充电
      if (chargeStore.chargeProgress >= 100) {
        stopCharging()
      }
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// 停止充电
const stopCharging = () => {
  const session = chargeStore.stopCharging()
  if (session) {
    // 更新业务流程状态
    businessStore.finishCharging(session)
    
    // 显示充电完成提示
    import('vant').then(({ showToast }) => {
      showToast({
        message: '充电完成，请前往支付',
        type: 'success',
        duration: 2000
      })
    })
    
    // 跳转到支付页面
    router.push(`/pay/${session.id}`)
  }
}

// 返回上一页
const goBack = () => {
  showStopConfirm.value = true
}

// 生命周期
onMounted(() => {
  initChargeSession()
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  // 注意：如果用户直接关闭页面，这里不会执行
  // 在实际应用中，可能需要在组件销毁前保存状态
})
</script>

<style scoped>
/* 大众品牌风格充电页面 */
.volkswagen-charge-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
}

/* 顶部导航栏 */
.volkswagen-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  width: 36px;
  height: 36px;
  background: rgba(8, 28, 84, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(8, 28, 84, 0.2);
  transform: scale(1.05);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #081c54;
  letter-spacing: 1px;
  line-height: 1;
}

.logo-subtitle {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 主要内容区域 */
.main-content {
  padding: 80px 20px 100px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 充电桩卡片 */
.volkswagen-station-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.volkswagen-station-card:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(8, 28, 84, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.station-title {
  font-size: 24px;
  font-weight: 600;
  color: #081c54;
  margin: 0;
  line-height: 1.3;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 60px;
}

.status-badge.charging-status {
  background: rgba(8, 28, 84, 0.1);
  color: #081c54;
  border: 1px solid rgba(8, 28, 84, 0.3);
}

.address {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 通用区块样式 */
.volkswagen-section {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.volkswagen-section:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(8, 28, 84, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #081c54;
  margin: 0 0 16px 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #081c54, #1989fa);
  border-radius: 2px;
}

/* 进度环 */
.progress-section {
  display: flex;
  justify-content: center;
}

.progress-ring {
  position: relative;
  width: 200px;
  height: 200px;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

.progress-ring circle {
  transition: stroke-dashoffset 0.3s ease;
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-text {
  font-size: 32px;
  font-weight: 700;
  color: #081c54;
  line-height: 1;
}

.energy-text {
  font-size: 16px;
  color: #666;
  margin-top: 5px;
}

/* 设备信息 */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.device-item:last-child {
  border-bottom: none;
}

.device-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.device-item .value {
  font-size: 14px;
  color: #333;
  text-align: right;
  font-weight: 500;
}

.price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 16px;
}

/* 设施服务 */
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
  padding: 8px 0;
}

/* 充电动画 */
.charging-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 30px;
}

.pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #081c54;
  opacity: 0.3;
  animation: pulse 2s infinite ease-out;
}

.charging-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: flash 1.5s infinite alternate;
}

/* 底部操作栏 */
.volkswagen-bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  gap: 12px;
  z-index: 100;
}

.volkswagen-btn {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #081c54, #1989fa);
  color: #fff;
  box-shadow: 0 4px 15px rgba(8, 28, 84, 0.3);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #0a2468, #1a7ce8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(8, 28, 84, 0.4);
}

.primary-btn:active {
  transform: translateY(0);
}

/* 动画定义 */
@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes flash {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 80px 16px 100px;
  }
  
  .volkswagen-station-card,
  .volkswagen-section {
    padding: 20px;
  }
  
  .station-title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .progress-ring {
    width: 180px;
    height: 180px;
  }
  
  .progress-text {
    font-size: 28px;
  }
  
  .volkswagen-bottom-actions {
    padding: 16px;
  }
  
  .volkswagen-btn {
    height: 48px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .volkswagen-header {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .main-content {
    padding: 80px 12px 100px;
  }
  
  .volkswagen-station-card,
  .volkswagen-section {
    padding: 16px;
  }
}
</style>