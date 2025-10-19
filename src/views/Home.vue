<template>
  <div class="volkswagen-container">
    <!-- 大众风格的顶部导航栏 -->
    <div class="volkswagen-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-text">VOLKSWAGEN</span>
          <span class="logo-subtitle">充电网络</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 搜索框已移动到侧边栏 -->
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 移动端悬浮按钮 -->
      <div class="mobile-floating-btn" v-if="isMobile" @click="goToFilterPage">
        <CustomIcon name="charging-station" :size="20" color="#fff" />
        <span class="btn-text">筛选</span>
      </div>

      <!-- 左侧侧边栏 -->
      <div 
        class="sidebar" 
        :class="{ collapsed: sidebarCollapsed, 'mobile-overlay': isMobile }"
        @click="closeSidebarOnOverlay"
      >
        <!-- 始终显示的头部 -->
        <div class="sidebar-header">
          <h2 class="sidebar-title" v-show="!sidebarCollapsed">充电桩筛选</h2>
          <div class="sidebar-toggle" @click="toggleSidebar">
            <CustomIcon :name="sidebarCollapsed ? 'charging-station' : 'clear-route'" :size="16" color="#081c54" />
          </div>
        </div>
        
        
        <!-- 可折叠的内容 -->
        <div 
          class="sidebar-content" 
          :class="{ collapsed: sidebarCollapsed }"
          :style="{ 
            maxHeight: sidebarCollapsed ? '0px' : '1000px',
            opacity: sidebarCollapsed ? 0 : 1
          }"
        >
          <!-- 筛选器 -->
          <div class="volkswagen-filters" :class="{ 'animate-in': !sidebarCollapsed }">
            <div class="filter-group">
              <label>充电类型</label>
              <div class="filter-options">
                <div
                  v-for="(type, index) in chargeTypes"
                  :key="type.value"
                  class="filter-chip"
                  :class="{ 
                    active: stationStore.filterOptions.type === type.value,
                    'animate-in': !sidebarCollapsed
                  }"
                  :style="{ 
                    animationDelay: (index * 0.05) + 's'
                  }"
                  @click="setFilter('type', type.value)"
                >
                  {{ type.label }}
                </div>
              </div>
            </div>
            
            <div class="filter-group">
              <label>状态</label>
              <div class="filter-options">
                <div
                  v-for="(status, index) in chargeStatuses"
                  :key="status.value"
                  class="filter-chip"
                  :class="{ 
                    active: stationStore.filterOptions.status === status.value,
                    'animate-in': !sidebarCollapsed
                  }"
                  :style="{ 
                    animationDelay: ((index + 3) * 0.05) + 's'
                  }"
                  @click="setFilter('status', status.value)"
                >
                  {{ status.label }}
                </div>
              </div>
            </div>
            
            <div class="filter-group">
              <label>排序</label>
              <div class="filter-options">
                <div
                  v-for="(sort, index) in sortOptions"
                  :key="sort.value"
                  class="filter-chip"
                  :class="{ 
                    active: stationStore.filterOptions.sortBy === sort.value,
                    'animate-in': !sidebarCollapsed
                  }"
                  :style="{ 
                    animationDelay: ((index + 7) * 0.05) + 's'
                  }"
                  @click="setFilter('sortBy', sort.value)"
                >
                  {{ sort.label }}
                </div>
              </div>
            </div>
            
            <!-- 搜索框 -->
            <div class="filter-group search-group" :class="{ 'animate-in': !sidebarCollapsed }">
              <label>搜索</label>
              <div class="search-container">
                <input 
                  type="text" 
                  placeholder="搜索充电桩位置..." 
                  v-model="searchQuery"
                  class="volkswagen-search"
                />
                <CustomIcon name="search" :size="16" color="#666" class="search-icon" />
              </div>
            </div>
          </div>

          <!-- 充电桩列表 -->
          <div class="station-list-container" :class="{ 'animate-in': !sidebarCollapsed }">
            <div class="list-header">
              <span class="count">{{ searchResults.length }} 个充电桩</span>
            </div>
            <div class="station-list">
              <div
                v-for="(station, index) in searchResults"
                :key="station.id"
                class="volkswagen-station-item"
                :class="{ 
                  selected: selectedStationId === station.id,
                  'animate-in': !sidebarCollapsed
                }"
                  :style="{ 
                    animationDelay: (index * 0.03 + 0.3) + 's'
                  }"
                @click="selectStation(station)"
              >
                <div class="station-header">
                  <h3 class="station-name">{{ station.name }}</h3>
                  <div class="station-status" :class="getStatusClass(station.status)">
                    {{ station.status }}
                  </div>
                </div>
                <p class="station-address">{{ station.address }}</p>
                <div class="station-details">
                  <div class="detail-item">
                    <span class="label">距离</span>
                    <span class="value">{{ station.distance ? station.distance + 'km' : '定位中...' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">价格</span>
                    <span class="value">¥{{ station.price }}/kWh</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">可用</span>
                    <span class="value">{{ station.availablePorts }}/{{ station.totalPorts }}</span>
                  </div>
                </div>
                <div class="station-features">
                  <span
                    v-for="(feature, index) in station.features.slice(0, 3)"
                    :key="index"
                    class="feature-tag"
                  >
                    {{ feature }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图区域 -->
      <div class="map-container">
        <MapView
          :stations="searchResults"
          :selected-station-id="selectedStationId"
          @select-station="handleStationSelect"
          ref="mapRef"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStationStore } from '../stores/stationStore'
import { useBusinessStore } from '../stores/businessStore'
import { utils } from '../api/mockService'
import MapView from '../components/MapView.vue'
import CustomIcon from '../components/CustomIcon.vue'
// Vant 组件已在 main.js 中全局注册

const stationStore = useStationStore()
const businessStore = useBusinessStore()
const router = useRouter()
const mapRef = ref(null)

// 响应式数据
const selectedStationId = ref(null)
const searchQuery = ref('')
const sidebarCollapsed = ref(false)
const isMobile = ref(false)

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  // 移动端默认收起侧边栏
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

// 简化的移动端处理
const handleMobileKeyboard = () => {
  // 移除复杂的键盘处理逻辑，使用简单的CSS方案
  console.log('移动端键盘处理已简化')
}

// 筛选选项
const chargeTypes = [
  { label: '全部', value: 'all' },
  { label: '快充', value: '快充' },
  { label: '慢充', value: '慢充' }
]

const chargeStatuses = [
  { label: '全部', value: 'all' },
  { label: '空闲', value: '空闲' },
  { label: '部分空闲', value: '部分空闲' },
  { label: '繁忙', value: '繁忙' }
]

const sortOptions = [
  { label: '距离最近', value: 'distance' },
  { label: '价格最低', value: 'price' }
]

// 计算搜索结果
const searchResults = computed(() => {
  let results = stationStore.filteredStations
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(station => 
      station.name.toLowerCase().includes(query) ||
      station.address.toLowerCase().includes(query) ||
      station.operator.toLowerCase().includes(query)
    )
  }
  
  return results
})

// 方法
const handleStationSelect = (station) => {
  selectedStationId.value = station.id
  businessStore.selectStation(station)
}

const selectStation = (station) => {
  selectedStationId.value = station.id
  businessStore.selectStation(station)
  
  // 显示选择提示
  import('vant').then(({ showToast }) => {
    showToast({
      message: `已选择 ${station.name}`,
      type: 'success',
      duration: 1500
    })
  })
  
  // 跳转到详情页
  router.push(`/station/${station.id}`)
}

const setFilter = (type, value) => {
  stationStore.updateFilter(type, value)
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 点击遮罩层关闭侧边栏
const closeSidebarOnOverlay = (event) => {
  if (isMobile.value && !sidebarCollapsed.value && event.target === event.currentTarget) {
    sidebarCollapsed.value = true
  }
}

// 跳转到筛选页面
const goToFilterPage = () => {
  router.push('/filter')
}

const getStatusClass = (status) => {
  switch (status) {
    case '空闲': return 'status-free'
    case '部分空闲': return 'status-partial'
    case '繁忙': return 'status-busy'
    default: return ''
  }
}

// 处理路线规划请求
const handleRoutePlanning = async () => {
  try {
    const route = useRoute()
    const planRouteId = route?.query?.planRoute
    
    if (planRouteId) {
      await nextTick()
      // 等待地图组件加载完成
      setTimeout(() => {
        if (window.planRouteToStation) {
          window.planRouteToStation(parseInt(planRouteId))
          router.replace({ path: '/' })
        } else {
          console.warn('路线规划服务未就绪')
        }
      }, 2000) // 等待2秒确保地图和路线规划服务加载完成
    }
  } catch (error) {
    console.warn('路线规划处理失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 检测移动端
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 初始化移动端键盘处理
  setTimeout(() => {
    handleMobileKeyboard()
  }, 500) // 延迟执行，确保DOM已渲染
  
  // 初始化业务流程
  businessStore.startFindFlow()
  
  await stationStore.fetchStations()
  
  // 检查是否需要规划路线
  await handleRoutePlanning()
  
  // 调试信息：显示距离计算状态
  console.log('充电桩数据加载完成，共', stationStore.stations.length, '个充电桩')
  if (stationStore.userLocation) {
    console.log('用户位置:', stationStore.userLocation)
    console.log('已计算距离的充电桩:', stationStore.stations.filter(s => s.distance !== undefined).length)
  } else {
    console.log('用户位置未设置，距离将在定位成功后动态计算')
  }
  
  // 测试距离计算功能
  setTimeout(() => {
    utils.testDistanceCalculation()
  }, 2000) // 延迟2秒执行，确保高德地图API已加载
})
</script>

<style scoped>
/* 透明效果 */
.volkswagen-container {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  color: #081c54;
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
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #081c54;
  letter-spacing: 0.5px;
}

.logo-subtitle {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.volkswagen-search {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 9px 16px 9px 40px;
  color: #081c54;
  font-size: 14px;
  width: 100%;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.volkswagen-search:focus {
  border-color: #081c54;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 3px rgba(8, 28, 84, 0.1);
}

.volkswagen-search::placeholder {
  color: #999;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #666;
  font-size: 16px;
}

/* 侧边栏搜索组样式 */
.search-group {
  margin-top: 20px;
}

.search-group .search-container {
  margin-top: 8px;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  height: 100vh;
  padding-top: 60px;
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease-out;
  z-index: 100;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 20px 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
}

.sidebar.collapsed .sidebar-header {
  padding: 20px 15px;
  justify-content: center;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #081c54;
  margin: 0;
  transition: opacity 0.25s ease-out;
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  color: #081c54;
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(1.05);
}

.sidebar.collapsed .sidebar-toggle {
  background: rgba(8, 28, 84, 0.1);
}

.sidebar.collapsed .sidebar-toggle:hover {
  background: rgba(8, 28, 84, 0.2);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 15px;
  transition: all 0.25s ease-out;
  transform-origin: top;
}

.sidebar-content.collapsed {
  padding: 0 20px;
  transform: scaleY(0);
  opacity: 0;
}

/* 筛选器 */
.volkswagen-filters {
  margin-bottom: 24px;
}

/* 动画关键帧 */
@keyframes slideInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 动画类 */
.animate-in .filter-chip,
.animate-in .volkswagen-station-item {
  animation: slideInFromLeft 0.25s ease-out forwards;
}

.animate-in .filter-group {
  animation: fadeInUp 0.25s ease-out forwards;
}

.station-list-container.animate-in .list-header {
  animation: fadeInUp 0.25s ease-out 0.1s forwards;
  opacity: 0;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.filter-chip {
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  font-size: 12px;
  color: #081c54;
  cursor: pointer;
  transition: all 0.25s ease-out;
  opacity: 0;
  transform: translateX(-10px);
  backdrop-filter: blur(5px);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-chip.active {
  background: #081c54;
  border-color: #081c54;
  color: #fff;
  box-shadow: 0 2px 10px rgba(8, 28, 84, 0.2);
}

/* 充电桩列表 */
.station-list-container {
  flex: 1;
}

.list-header {
  margin-bottom: 16px;
}

.count {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.station-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.volkswagen-station-item {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease-out;
  opacity: 0;
  transform: translateX(-10px);
  backdrop-filter: blur(5px);
}

.volkswagen-station-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(8, 28, 84, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.volkswagen-station-item.selected {
  background: rgba(8, 28, 84, 0.05);
  border-color: #081c54;
  box-shadow: 0 4px 15px rgba(8, 28, 84, 0.1);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.station-name {
  font-size: 16px;
  font-weight: 600;
  color: #081c54;
  margin: 0;
  flex: 1;
}

.station-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.station-status.status-free {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
  border: 1px solid rgba(52, 199, 89, 0.2);
  border-radius: 6px;
}

.station-status.status-partial {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
  border: 1px solid rgba(255, 149, 0, 0.2);
  border-radius: 6px;
}

.station-status.status-busy {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 6px;
}

.station-address {
  font-size: 12px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.station-details {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-item .label {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item .value {
  font-size: 12px;
  color: #081c54;
  font-weight: 500;
}

.station-features {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.feature-tag {
  padding: 3px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-size: 10px;
  color: #081c54;
  backdrop-filter: blur(3px);
}

/* 地图容器 */
.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 移动端悬浮按钮 */
.mobile-floating-btn {
  position: fixed;
  bottom: 50px;
  left: 10px;
  z-index: 300;
  background: linear-gradient(135deg, rgba(8, 28, 84, 0.6) 0%, rgba(10, 36, 104, 0.6) 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 16px;
  box-shadow: 0 4px 15px rgba(8, 28, 84, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.mobile-floating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(8, 28, 84, 0.4);
}

.mobile-floating-btn:active {
  transform: translateY(0);
}

.btn-text {
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    height: 100vh !important;
    width: 85% !important;
    max-width: 350px !important;
    z-index: 250 !important;
    transform: translateX(-100%) !important;
    transition: transform 0.3s ease-out !important;
    box-shadow: 2px 0 20px rgba(0, 0, 0, 0.15) !important;
    background: #ffffff !important;
    backdrop-filter: none !important;
    /* 使用JavaScript动态调整高度 */
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .sidebar.mobile-overlay {
    background: #ffffff !important;
    backdrop-filter: none !important;
  }
  
  .sidebar.mobile-overlay:not(.collapsed)::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
    animation: fadeIn 0.3s ease-out;
  }
  
  .main-content {
    padding-left: 0;
  }
  
  .map-container {
    width: 100%;
  }
  
  /* 强制移动端侧边栏为白色背景 */
  .sidebar,
  .sidebar.mobile-overlay,
  .sidebar-content,
  .sidebar-header,
  .volkswagen-filters,
  .station-list-container {
    background: #ffffff !important;
    background-color: #ffffff !important;
  }
  
  /* 确保移动端侧边栏内容区域也是白色，但保持按钮样式 */
  .sidebar .filter-chip {
    background: rgba(255, 255, 255, 0.7) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
  }
  
  .sidebar .filter-chip.active {
    background: #081c54 !important;
    border-color: #081c54 !important;
    color: #fff !important;
  }
  
  .sidebar .volkswagen-station-item {
    background: rgba(255, 255, 255, 0.9) !important;
  }
  
  .sidebar .volkswagen-search {
    background: rgba(255, 255, 255, 0.8) !important;
    /* 防止输入法弹出时影响布局 */
    font-size: 16px; /* 防止iOS缩放 */
    transform: translateZ(0); /* 启用硬件加速 */
  }
  
  
  /* 移动端输入框优化 */
  .sidebar input[type="text"] {
    font-size: 16px !important; /* 防止iOS自动缩放 */
    transform: translateZ(0); /* 启用硬件加速 */
  }
  
  /* 防止输入法弹出时页面滚动 */
  .sidebar:not(.collapsed) {
    position: fixed !important;
    height: 100vh !important;
    max-height: 100vh !important;
  }
}

@media (max-width: 480px) {
  .volkswagen-header {
    padding: 0 16px;
  }
  
  .logo-text {
    font-size: 20px;
  }
}

/* 移动端输入法适配 */
@media (max-width: 768px) {
  /* 防止输入法弹出时页面布局变化 */
  .volkswagen-container {
    height: 100vh;
    height: -webkit-fill-available; /* iOS Safari */
    overflow: hidden;
  }
  
  .main-content {
    height: 100vh;
    height: -webkit-fill-available; /* iOS Safari */
  }
  
  /* 输入框聚焦时的处理 */
  .sidebar input:focus {
    position: relative;
    z-index: 1000;
  }
  
  /* 简化的移动端侧边栏样式 */
  .sidebar.mobile-overlay:not(.collapsed) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    height: 100vh !important;
    width: 85% !important;
    max-width: 350px !important;
    z-index: 250 !important;
    transform: translateX(0) !important;
    overflow-y: auto !important;
  }
}
</style>