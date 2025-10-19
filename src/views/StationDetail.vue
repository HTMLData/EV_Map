<template>
  <div class="volkswagen-detail-container">
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
      <!-- 充电桩基本信息 -->
      <div class="volkswagen-station-card">
        <div class="station-header">
          <h1 class="station-title">{{ station?.name }}</h1>
          <div class="status-badge" :class="getStatusClass(station?.status)">
            {{ station?.status }}
          </div>
        </div>
        <p class="address">{{ station?.address }}</p>
        <div class="station-basic-info">
          <div class="info-item">
            <CustomIcon name="location" :size="16" color="#081c54" />
            <span>{{ station?.distance ? station.distance + 'km' : '定位中...' }}</span>
          </div>
          <div class="info-item">
            <CustomIcon name="charging-station" :size="16" color="#52c41a" />
            <span>{{ station?.hours }}</span>
          </div>
          <div class="info-item">
            <CustomIcon name="charging-station" :size="16" color="#fa8c16" />
            <span>{{ station?.operator }}</span>
          </div>
        </div>
      </div>

      <!-- 充电设备信息 -->
      <div class="volkswagen-section">
        <h2 class="section-title">充电设备</h2>
        <div class="device-info">
          <div class="device-item">
            <span class="label">充电桩类型</span>
            <div class="value">
              <span
                v-for="(type, index) in station?.type"
                :key="index"
                class="volkswagen-chip"
              >
                {{ type }}
              </span>
            </div>
          </div>
          <div class="device-item">
            <span class="label">充电桩状态</span>
            <span class="value status-text" :class="getStatusClass(station?.status)">
              {{ station?.status }}
            </span>
          </div>
          <div class="device-item">
            <span class="label">端口数量</span>
            <span class="value">{{ station?.totalPorts }} 个（可用：{{ station?.availablePorts }} 个）</span>
          </div>
          <div class="device-item">
            <span class="label">充电功率</span>
            <span class="value">{{ station?.power.join('、') }}</span>
          </div>
          <div class="device-item">
            <span class="label">充电价格</span>
            <span class="value price">¥{{ station?.price }}/kWh</span>
          </div>
        </div>
      </div>

      <!-- 设施服务 -->
      <div class="volkswagen-section">
        <h2 class="section-title">设施服务</h2>
        <div class="features">
          <div
            v-for="(feature, index) in station?.features"
            :key="index"
            class="feature-item"
          >
            <CustomIcon name="charging-station" :size="16" color="#081c54" />
            <span>{{ feature }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="volkswagen-bottom-actions">
      <button class="volkswagen-btn nav-btn" @click="navigate">
        <CustomIcon name="navigation" :size="18" color="#081c54" />
        <span>导航</span>
      </button>
      <button class="volkswagen-btn primary-btn" @click="startCharging">
        <CustomIcon name="charging-station" :size="18" color="#fff" />
        <span>开始充电</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStationStore } from '../stores/stationStore'
import { useBusinessStore } from '../stores/businessStore'
import CustomIcon from '../components/CustomIcon.vue'
// Vant 组件已在 main.js 中全局注册

const route = useRoute()
const router = useRouter()
const stationStore = useStationStore()
const businessStore = useBusinessStore()

let station = ref(null)

// 获取充电桩信息
const fetchStationDetail = async () => {
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
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 导航到充电桩
const navigate = () => {
  if (!station.value) return
  
  // 更新业务流程状态
  businessStore.startNavigation(station.value.id)
  
  // 显示导航提示
  import('vant').then(({ showToast }) => {
    showToast({
      message: `开始导航到 ${station.value.name}`,
      type: 'success',
      duration: 2000
    })
  })
  
  // 跳转到首页并规划路线
  router.push({
    path: '/',
    query: { 
      planRoute: station.value.id,
      stationName: station.value.name
    }
  })
}

// 开始充电
const startCharging = () => {
  if (!station.value) return
  
  // 检查充电桩状态
  if (station.value.status === '繁忙') {
    import('vant').then(({ showToast }) => {
      showToast({
        message: '该充电桩当前繁忙，请选择其他充电桩',
        type: 'fail',
        duration: 3000
      })
    })
    return
  }
  
  // 更新业务流程状态
  businessStore.startCharging(station.value)
  
  // 显示充电开始提示
  import('vant').then(({ showToast }) => {
    showToast({
      message: `开始充电 - ${station.value.name}`,
      type: 'success',
      duration: 2000
    })
  })
  
  router.push(`/charge/${station.value.id}`)
}

// 获取状态样式
const getStatusClass = (status) => {
  switch (status) {
    case '空闲': return 'status-free'
    case '部分空闲': return 'status-partial'
    case '繁忙': return 'status-busy'
    default: return ''
  }
}

// 生命周期
onMounted(() => {
  fetchStationDetail()
})
</script>

<style scoped>
/* 大众品牌风格详情页 */
.volkswagen-detail-container {
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

.status-badge.status-free {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.status-badge.status-partial {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
  border: 1px solid rgba(250, 173, 20, 0.3);
}

.status-badge.status-busy {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
  border: 1px solid rgba(245, 34, 45, 0.3);
}

.address {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.station-basic-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
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

.volkswagen-chip {
  background: rgba(8, 28, 84, 0.1);
  color: #081c54;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  border: 1px solid rgba(8, 28, 84, 0.2);
}

.status-text {
  font-weight: 600;
}

.status-free { color: #52c41a; }
.status-partial { color: #faad14; }
.status-busy { color: #f5222d; }

.price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 16px;
}

/* 设施服务 */
.features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.nav-btn {
  background: rgba(8, 28, 84, 0.1);
  color: #081c54;
  border: 1px solid rgba(8, 28, 84, 0.2);
}

.nav-btn:hover {
  background: rgba(8, 28, 84, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(8, 28, 84, 0.2);
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
  
  .features {
    grid-template-columns: 1fr;
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