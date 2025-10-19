<template>
  <div class="volkswagen-pay-container">
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
      <!-- 支付金额卡片 -->
      <div class="volkswagen-station-card">
        <div class="station-header">
          <h1 class="station-title">支付订单</h1>
          <div class="status-badge payment-status">
            待支付
          </div>
        </div>
        <div class="amount-section">
          <div class="amount-label">应付金额</div>
          <div class="amount-value">¥{{ session?.totalCost.toFixed(2) }}</div>
        </div>
      </div>

      <!-- 订单详情 -->
      <div class="volkswagen-section">
        <h2 class="section-title">订单信息</h2>
        <div class="device-info">
          <div class="device-item">
            <span class="label">订单编号</span>
            <span class="value">{{ session?.id }}</span>
          </div>
          <div class="device-item">
            <span class="label">充电站</span>
            <span class="value">{{ session?.stationName }}</span>
          </div>
          <div class="device-item">
            <span class="label">充电电量</span>
            <span class="value">{{ session?.totalEnergy.toFixed(2) }}kWh</span>
          </div>
          <div class="device-item">
            <span class="label">充电时长</span>
            <span class="value">{{ formatDuration(session?.startTime, session?.endTime) }}</span>
          </div>
          <div class="device-item">
            <span class="label">充电时间</span>
            <span class="value">{{ formatDateTime(session?.startTime) }}</span>
          </div>
          <div class="device-item">
            <span class="label">单价</span>
            <span class="value">¥{{ session?.pricePerKWh }}/kWh</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="volkswagen-section">
        <h2 class="section-title">支付方式</h2>
        <div class="payment-methods">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            class="method-item"
            :class="{ active: selectedMethod === method.id }"
            @click="selectedMethod = method.id"
          >
            <div class="method-info">
              <div class="method-icon">{{ method.icon }}</div>
              <div class="method-name">{{ method.name }}</div>
            </div>
            <CustomIcon 
              :name="selectedMethod === method.id ? 'charging-station' : 'charging-station'" 
              :size="16" 
              :color="selectedMethod === method.id ? '#081c54' : '#ccc'" 
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="volkswagen-bottom-actions">
      <div class="amount-summary">
        <span>合计：</span>
        <span class="total-amount">¥{{ session?.totalCost.toFixed(2) }}</span>
      </div>
      <button class="volkswagen-btn primary-btn" @click="confirmPayment">
        <CustomIcon name="charging-station" :size="18" color="#fff" />
        <span>确认支付</span>
      </button>
    </div>

    <!-- 支付成功弹窗 -->
    <van-popup v-model:show="showSuccessPopup" position="center" :round="true">
      <div class="success-popup">
        <div class="success-icon">
          <van-icon name="success" size="64" color="#52c41a" />
        </div>
        <h3>支付成功</h3>
        <p>您的充电订单已支付完成</p>
        <div class="success-amount">¥{{ session?.totalCost.toFixed(2) }}</div>
        <van-button type="primary" size="large" @click="finishPayment">
          完成
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChargeStore } from '../stores/chargeStore'
import { useBusinessStore } from '../stores/businessStore'
import CustomIcon from '../components/CustomIcon.vue'
// Vant 组件已在 main.js 中全局注册

const route = useRoute()
const router = useRouter()
const chargeStore = useChargeStore()
const businessStore = useBusinessStore()

const selectedMethod = ref('wechat')
const showSuccessPopup = ref(false)

// 支付方式
const paymentMethods = [
  {
    id: 'wechat',
    name: '微信支付',
    icon: '微信'
  },
  {
    id: 'alipay',
    name: '支付宝',
    icon: '支付宝'
  },
  {
    id: 'card',
    name: '银行卡',
    icon: '银行卡'
  }
]

// 获取当前会话
const session = computed(() => {
  const id = parseInt(route.params.id)
  return chargeStore.chargeHistory.find(s => s.id === id)
})

// 格式化时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化时长
const formatDuration = (start, end) => {
  if (!start || !end) return ''
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const duration = Math.floor((endTime - startTime) / 1000)
  
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = duration % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 确认支付
const confirmPayment = () => {
  if (!session.value) return
  
  // 模拟支付延迟
  setTimeout(() => {
    // 标记为已支付
    chargeStore.completePayment(session.value.id)
    // 更新业务流程状态
    businessStore.completePayment()
    // 显示支付成功弹窗
    showSuccessPopup.value = true
  }, 1500)
}

// 完成支付
const finishPayment = () => {
  showSuccessPopup.value = false
  
  // 显示支付完成提示
  import('vant').then(({ showToast }) => {
    showToast({
      message: '支付完成，感谢使用！',
      type: 'success',
      duration: 2000
    })
  })
  
  // 跳转到首页
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 检查会话是否存在
onMounted(() => {
  if (!session.value) {
    router.replace('/')
  }
})
</script>

<style scoped>
/* 大众品牌风格支付页面 */
.volkswagen-pay-container {
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

/* 支付金额卡片 */
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
  margin-bottom: 20px;
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

.status-badge.payment-status {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid rgba(250, 173, 20, 0.3);
}

.amount-section {
  text-align: center;
}

.amount-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.amount-value {
  font-size: 36px;
  font-weight: 700;
  color: #ff6b6b;
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

/* 支付方式 */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.method-item:hover {
  border-color: rgba(8, 28, 84, 0.3);
  background: rgba(8, 28, 84, 0.05);
}

.method-item.active {
  border-color: #081c54;
  background: rgba(8, 28, 84, 0.1);
}

.method-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  width: 32px;
  height: 32px;
  background: rgba(8, 28, 84, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #081c54;
  font-weight: 500;
}

.method-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 底部操作栏 */
.volkswagen-bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.amount-summary {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b6b;
}

.volkswagen-btn {
  flex-shrink: 0;
  width: 140px;
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

/* 成功弹窗 */
.success-popup {
  text-align: center;
  padding: 30px;
  width: 80%;
  max-width: 300px;
}

.success-icon {
  margin-bottom: 20px;
}

.success-popup h3 {
  font-size: 20px;
  color: #333;
  margin: 0 0 10px 0;
}

.success-popup p {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.success-amount {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b6b;
  margin-bottom: 25px;
}

.success-popup .van-button {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  background-color: #081c54;
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
  
  .amount-value {
    font-size: 32px;
  }
  
  .volkswagen-bottom-actions {
    padding: 16px;
  }
  
  .volkswagen-btn {
    height: 48px;
    font-size: 15px;
    width: 120px;
  }
  
  .success-popup {
    width: 90%;
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