<template>
  <div class="mobile-container">
    <!-- 顶部搜索栏 -->
    <div class="mobile-header">
      <div class="search-container">
        <van-search
          v-model="searchQuery"
          placeholder="搜索充电桩名称或地址"
          @search="handleSearch"
          @clear="handleClearSearch"
          @input="handleSearchInput"
          shape="round"
          background="rgba(255, 255, 255, 0.95)"
        />
        </div>
      <div class="header-actions">
        <button class="action-btn" @click="toggleSearch">
          <van-icon name="search" />
        </button>
        <button class="action-btn" @click="goToFilterPage">
          <van-icon name="filter-o" />
        </button>
      </div>
      </div>

    <!-- 全屏地图 -->
    <div class="map-fullscreen">
      <MapView
        :stations="searchResults"
        :selected-station-id="selectedStationId"
        @select-station="handleStationSelect"
        ref="mapRef"
      />
    </div>

    <!-- 底部站点卡片 -->
    <div class="bottom-card" :class="{ 
      'card-expanded': selectedStation, 
      'list-expanded': showStationList,
      'card-collapsed': cardCollapsed,
      'dragging': isDragging
    }">
      <div class="card-handle" 
           @click="toggleCard"
           @touchstart="handleCardTouchStart"
           @touchmove="handleCardTouchMove"
           @touchend="handleCardTouchEnd"
           @touchcancel="handleCardTouchEnd">
        <div class="handle-bar"></div>
        <div class="handle-text" v-if="cardCollapsed">上拉查看充电桩</div>
      </div>

      <!-- 收起预览区（下拉后显示前两条简要信息） -->
      <div class="collapsed-preview" v-if="cardCollapsed">
        <div class="collapsed-title">
          <van-icon name="location-o" />
          <span>附近推荐</span>
        </div>
        <div class="collapsed-items">
          <div 
            v-for="station in collapsedPreviewStations" 
            :key="station.stationId" 
            class="collapsed-item"
            @click="expandFromPreview(station)"
          >
            <div class="collapsed-item-left">
              <div class="collapsed-name">{{ station.stationName }}</div>
              <div class="collapsed-sub">{{ station.address }}</div>
          </div>
            <div class="collapsed-item-right">
              <div class="collapsed-distance">{{ station.distance ? station.distance + 'km' : '定位中...' }}</div>
              <div class="collapsed-availability">
                <span class="c-fast">快 {{ station.quickAvailableNum }}/{{ station.quickChargeNum }}</span>
                <span class="c-slow" v-if="station.slowChargeNum > 0">慢 {{ station.slowAvailableNum }}/{{ station.slowChargeNum }}</span>
        </div>
            </div>
                </div>
              </div>
            </div>
            
      <!-- 站点详情卡片 -->
      <div class="card-content" v-if="selectedStation && !showStationList && !cardCollapsed">
        <div class="station-header">
          <h3 class="station-name">{{ selectedStation.stationName }}</h3>
          <div class="station-distance">{{ selectedStation.distance ? selectedStation.distance + 'km' : '定位中...' }}</div>
                </div>
        
        <div class="station-info">
          <p class="station-address">{{ selectedStation.address }}</p>
          
          <div class="station-tags">
            <div class="tag-group">
              <span class="tag fast-charge">
                <van-icon name="flash" />
                快充 {{ selectedStation.quickAvailableNum }}/{{ selectedStation.quickChargeNum }}
              </span>
              <span class="tag slow-charge" v-if="selectedStation.slowChargeNum > 0">
                <van-icon name="clock" />
                慢充 {{ selectedStation.slowAvailableNum }}/{{ selectedStation.slowChargeNum }}
              </span>
            </div>
            
            <div class="price-info">
              <span class="price">¥{{ selectedStation.totalCostPrice }}/kWh</span>
              <span class="brand">{{ selectedStation.brandName }}</span>
              </div>
            </div>
            
          <div class="station-actions">
            <van-button type="primary" size="small" @click="goToStationDetail(selectedStation.stationId)">
              查看详情
            </van-button>
            <van-button type="default" size="small" @click="planRouteToStation(selectedStation.stationId)">
              导航前往
            </van-button>
                </div>
              </div>
            </div>
            
      <!-- 站点列表 -->
      <div class="station-list" v-if="(!selectedStation || showStationList) && !cardCollapsed">
        <div class="list-header">
          <div class="location-info">
            <van-icon name="location-o" />
            <span class="location-text">附近推荐</span>
              </div>
          <div class="list-actions">
            <button class="action-btn" @click="collapseCard">
              <van-icon name="cross" />
            </button>
            </div>
          </div>

        <!-- 排序和筛选栏 -->
        <div class="sort-filter-bar">
          <van-dropdown-menu>
            <van-dropdown-item 
              v-model="sortType" 
              :options="sortOptions" 
              @change="handleSortChange"
            />
            <van-dropdown-item 
              v-model="distanceFilter" 
              :options="distanceOptions" 
              @change="handleDistanceFilter"
            />
          </van-dropdown-menu>
          <button class="filter-btn" @click="goToFilterPage">
            <van-icon name="filter-o" />
            筛选
          </button>
            </div>

        <!-- 站点列表项 -->
        <div class="station-items scrollable-list" ref="stationListRef">
          <div
            v-for="(station, index) in sortedStations"
            :key="station.stationId"
            class="station-item"
            :class="{ 'item-selected': selectedStationId === station.stationId }"
            @click="selectStationFromList(station)"
          >
            <!-- 站点名称 -->
            <div class="item-title">
              <h4 class="station-name">{{ station.stationName }}</h4>
              <div class="station-tags">
                <span class="tag star-tag" v-if="station.stationGradeScore >= 4.5">
                  <van-icon name="star" />
                  星选
                </span>
                <span class="tag brand-tag">{{ station.brandName }}</span>
                <span class="tag discount-tag" v-if="station.totalCostPrice < 1.5">
                  <van-icon name="gift" />
                  充电优惠
                </span>
                  </div>
                </div>
            
            <!-- 价格信息 -->
            <div class="price-section">
              <div class="main-price">¥{{ station.totalCostPrice }}/度</div>
              <div class="price-breakdown">
                电费¥{{ station.electricityPrice }}/度+服务费¥{{ station.servicePrice }}/度
                  </div>
                  </div>
            
            <!-- 充电桩可用性 -->
            <div class="availability-section">
              <div class="availability-item">
                <span class="label fast-label">快</span>
                <span class="count">空{{ station.quickAvailableNum }}/{{ station.quickChargeNum }}</span>
                  </div>
              <div class="availability-item" v-if="station.slowChargeNum > 0">
                <span class="label slow-label">慢</span>
                <span class="count">空{{ station.slowAvailableNum }}/{{ station.slowChargeNum }}</span>
                </div>
                </div>
            
            <!-- 停车费说明 -->
            <div class="parking-info" v-if="station.parkFee">
              <van-icon name="info-o" />
              <span>{{ station.parkFee }}</span>
              </div>
            
            <!-- 操作按钮 -->
            <div class="item-actions">
              <van-button 
                type="default" 
                size="small" 
                icon="car-o"
                @click.stop="sendToCar(station)"
              >
                发送到车
              </van-button>
              <van-button 
                type="default" 
                size="small" 
                icon="location-o"
                @click.stop="navigateToStation(station)"
              >
                导航 ({{ station.distance ? station.distance + 'km' : '定位中...' }})
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStationStore } from '../stores/stationStore'
import { useBusinessStore } from '../stores/businessStore'
import { utils } from '../api/stationService'
import MapView from '../components/MapView.vue'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const stationStore = useStationStore()
const businessStore = useBusinessStore()

// 响应式数据
const searchQuery = ref('')
const selectedStationId = ref(null)
const selectedStation = ref(null)
const mapRef = ref(null)
const stationListRef = ref(null)
const isMobile = ref(false)
const showStationList = ref(false)
const cardCollapsed = ref(true) // 默认关闭状态
const cardTouchStartY = ref(null)
const cardTouchStartTime = ref(null)
const cardDragOffset = ref(0) // 拖拽偏移量
const isDragging = ref(false) // 是否正在拖拽
const cardHeight = ref(0) // 卡片当前高度

// 筛选选项
const chargeTypeFilter = ref('all')
const chargeStatusFilter = ref('all')

// 排序选项
const sortType = ref('distance')
const distanceFilter = ref('3km')

const chargeTypes = [
  { label: '全部', value: 'all' },
  { label: '快充', value: 'quick' },
  { label: '慢充', value: 'slow' }
]

const chargeStatuses = [
  { label: '全部', value: 'all' },
  { label: '营业中', value: '1' },
  { label: '暂停营业', value: '0' }
]

const sortOptions = [
  { text: '距离优先', value: 'distance' },
  { text: '快充桩数量', value: 'quickCount' },
  { text: '价格优先', value: 'price' }
]

const distanceOptions = [
  { text: '1KM', value: '1km' },
  { text: '3KM', value: '3km' },
  { text: '5KM', value: '5km' },
  { text: '10KM', value: '10km' }
]

// 计算搜索结果
const searchResults = computed(() => {
  let results = stationStore.filteredStations
  console.log('searchResults计算:', {
    filteredStations: stationStore.filteredStations.length,
    searchQuery: searchQuery.value,
    results: results.length
  })
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(station => 
      station.stationName.toLowerCase().includes(query) ||
      station.address.toLowerCase().includes(query) ||
      station.brandName.toLowerCase().includes(query)
    )
  }
  
  return results
})

// 计算排序后的站点列表
const sortedStations = computed(() => {
  let results = [...searchResults.value]
  
  // 按排序类型排序
  switch (sortType.value) {
    case 'distance':
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      break
    case 'quickCount':
      results.sort((a, b) => (b.quickAvailableNum || 0) - (a.quickAvailableNum || 0))
      break
    case 'price':
      results.sort((a, b) => (a.totalCostPrice || 0) - (b.totalCostPrice || 0))
      break
  }
  
  return results
})

// 监控数据变化
watch(() => stationStore.stations, (newVal) => {
  console.log('🔔 stationStore.stations变化:', newVal.length)
}, { deep: true })

watch(() => searchResults.value, (newVal) => {
  console.log('🔔 searchResults变化:', newVal.length)
}, { deep: true })

// 方法
const handleStationSelect = (station) => {
  selectedStationId.value = station.stationId
  selectedStation.value = station
  businessStore.selectStation(station)
}

const selectStation = (station) => {
  selectedStationId.value = station.stationId
  selectedStation.value = station
  businessStore.selectStation(station)
}

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleClearSearch = () => {
  searchQuery.value = ''
}

const handleSearchInput = () => {
  // 实时搜索逻辑
}

// 收起预览：前两条站点
const collapsedPreviewStations = computed(() => {
  return sortedStations.value.slice(0, 2)
})

// 从预览展开并聚焦站点
const expandFromPreview = (station) => {
  cardCollapsed.value = false
  showStationList.value = true
  selectedStation.value = null
  selectedStationId.value = station.stationId
  businessStore.selectStation(station)
  if (mapRef.value && mapRef.value.flyToStation) {
    mapRef.value.flyToStation(station)
  }
}

const toggleSearch = () => {
  // 切换搜索状态
}

const setFilter = (type, value) => {
  if (type === 'chargeType') {
    stationStore.filterOptions.chargeType = value
  } else if (type === 'openStatus') {
    stationStore.filterOptions.openStatus = value
  }
}

const toggleCard = () => {
  if (cardCollapsed.value) {
    // 如果已收起，则展开站点列表
    cardCollapsed.value = false
    showStationList.value = true
    selectedStation.value = null
    selectedStationId.value = null
  } else {
    // 如果已展开，则收起
    cardCollapsed.value = true
    selectedStation.value = null
    selectedStationId.value = null
    showStationList.value = false
  }
}

const handleCardTouchStart = (event) => {
  // 记录触摸开始位置和时间
  const touch = event.touches[0]
  cardTouchStartY.value = touch.clientY
  cardTouchStartTime.value = Date.now()
  isDragging.value = true
  cardDragOffset.value = 0
  
  // 获取当前卡片高度
  const collapsedHeight = window.innerHeight * 0.1667 // 16.67vh
  const expandedHeight = window.innerHeight * 0.75 // 75vh
  cardHeight.value = cardCollapsed.value ? collapsedHeight : expandedHeight
  
  console.log('🎯 开始拖拽:', {
    collapsed: cardCollapsed.value,
    startY: touch.clientY,
    collapsedHeight,
    expandedHeight,
    touchType: 'touchstart',
    touches: event.touches.length
  })
  
  // 防止页面滚动和默认行为
  event.preventDefault()
  event.stopPropagation()
}

const handleCardTouchMove = (event) => {
  if (!isDragging.value || !cardTouchStartY.value) return
  
  const touch = event.touches[0]
  const deltaY = touch.clientY - cardTouchStartY.value
  
  // 防止页面滚动和默认行为
  event.preventDefault()
  event.stopPropagation()
  
  // 计算拖拽偏移量（支持双向拖拽）
  // deltaY > 0 表示向下拖拽，deltaY < 0 表示向上拖拽
  cardDragOffset.value = -deltaY
  
  console.log('👆 拖拽移动:', {
    deltaY,
    dragOffset: cardDragOffset.value,
    collapsed: cardCollapsed.value,
    currentY: touch.clientY,
    startY: cardTouchStartY.value,
    touchType: 'touchmove',
    touches: event.touches.length,
    isDragging: isDragging.value,
    isUpward: deltaY < 0,
    isDownward: deltaY > 0
  })
  
  // 实时更新卡片高度
  updateCardHeight()
}

const handleCardTouchEnd = (event) => {
  if (!isDragging.value) return
  
  const threshold = 50 // 拖拽阈值
  
  console.log('🎯 结束拖拽:', {
    collapsed: cardCollapsed.value,
    dragOffset: cardDragOffset.value,
    threshold,
    shouldExpand: cardCollapsed.value && cardDragOffset.value > threshold,
    shouldCollapse: !cardCollapsed.value && cardDragOffset.value < -threshold,
    touchType: event?.type || 'touchend'
  })
  
  // 根据拖拽距离和方向决定是否切换状态
  if (Math.abs(cardDragOffset.value) > threshold) {
    if (cardCollapsed.value && cardDragOffset.value > threshold) {
      // 从收起状态向上拖拽超过阈值，展开
      console.log('📈 展开卡片')
      expandCard()
    } else if (!cardCollapsed.value && cardDragOffset.value < -threshold) {
      // 从展开状态向下拖拽超过阈值，收起
      console.log('📉 收起卡片')
      collapseCard()
    } else {
      // 拖拽距离不够，回弹到原状态
      console.log('🔄 回弹到原状态')
      resetCardPosition()
    }
  } else {
    // 拖拽距离不够，回弹到原状态
    console.log('🔄 拖拽距离不够，回弹')
    resetCardPosition()
  }
  
  // 重置状态
  cardTouchStartY.value = null
  cardTouchStartTime.value = null
  cardDragOffset.value = 0
  isDragging.value = false
  
  // 防止默认行为
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

// 更新卡片高度
const updateCardHeight = () => {
  const collapsedHeight = window.innerHeight * 0.1667
  const expandedHeight = window.innerHeight * 0.75
  
  let newHeight
  
  if (cardCollapsed.value) {
    // 从收起状态拖拽：完全跟手，不限制任何边界
    newHeight = collapsedHeight + cardDragOffset.value
    // 不设置任何限制，完全跟手
  } else {
    // 从展开状态拖拽：完全跟手，不限制任何边界
    newHeight = expandedHeight + cardDragOffset.value
    // 不设置任何限制，完全跟手
  }
  
  // 实时更新卡片高度
  const cardElement = document.querySelector('.bottom-card')
  if (cardElement) {
    cardElement.style.height = `${newHeight}px`
    // 强制重绘
    cardElement.style.transform = 'translateZ(0)'
  }
  
  console.log('📏 更新高度:', {
    collapsed: cardCollapsed.value,
    dragOffset: cardDragOffset.value,
    newHeight,
    collapsedHeight,
    expandedHeight,
    ratio: newHeight / window.innerHeight,
    isUpward: cardDragOffset.value > 0,
    isDownward: cardDragOffset.value < 0,
    elementHeight: cardElement?.style.height
  })
}

// 重置卡片位置
const resetCardPosition = () => {
  const cardElement = document.querySelector('.bottom-card')
  if (cardElement) {
    cardElement.style.height = ''
    cardElement.style.transition = 'height 0.3s ease'
    
    // 短暂延迟后移除transition，避免影响后续拖拽
    setTimeout(() => {
      cardElement.style.transition = ''
    }, 300)
  }
}

const toggleStationList = () => {
  showStationList.value = !showStationList.value
  if (!showStationList.value) {
    selectedStation.value = null
    selectedStationId.value = null
  }
}

const collapseCard = () => {
  cardCollapsed.value = true
  selectedStation.value = null
  selectedStationId.value = null
  showStationList.value = false
  
  // 重置卡片位置
  resetCardPosition()
}

const expandCard = () => {
  cardCollapsed.value = false
  showStationList.value = true
  selectedStation.value = null
  selectedStationId.value = null
  
  // 重置卡片位置
  resetCardPosition()
  
  // 滚动到列表顶部
  nextTick(() => {
    if (stationListRef.value) {
      stationListRef.value.scrollTop = 0
    }
  })
}

const selectStationFromList = (station) => {
  selectedStationId.value = station.stationId
  selectedStation.value = station
  businessStore.selectStation(station)
  
  // 滑动地图到对应Marker
  if (mapRef.value) {
    mapRef.value.flyToStation(station)
  }
}

const handleSortChange = (value) => {
  sortType.value = value
  console.log('排序方式改变:', value)
}

const handleDistanceFilter = (value) => {
  distanceFilter.value = value
  console.log('距离筛选改变:', value)
}

const sendToCar = (station) => {
  console.log('发送到车:', station.stationName)
  // 实现发送到车的逻辑
}

const navigateToStation = (station) => {
  console.log('导航到站点:', station.stationName)
  planRouteToStation(station.stationId)
}

const goToStationDetail = (stationId) => {
  router.push(`/station/${stationId}`)
}

const planRouteToStation = (stationId) => {
  // 规划路线逻辑
  console.log('规划路线到站点:', stationId)
}

const goToFilterPage = () => {
  router.push('/filter')
}

const goBack = () => {
  router.back()
}

// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 生命周期
onMounted(async () => {
  // 检测移动端
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 初始化业务流程
  businessStore.startFindFlow()
  
  console.log('🔄 开始调用fetchStations...')
  await stationStore.fetchStations()
  console.log('✅ fetchStations完成，当前stations数量:', stationStore.stations.length)
  
  // 检查是否需要规划路线
  await handleRoutePlanning()
  
  // 调试信息：显示距离计算状态
  console.log('📊 充电桩数据加载完成，共', stationStore.stations.length, '个充电桩')
  if (stationStore.userLocation) {
    console.log('用户位置:', stationStore.userLocation)
    console.log('已计算距离的充电桩:', stationStore.stations.filter(s => s.distance !== undefined).length)
  } else {
    console.log('用户位置未设置，距离将在定位成功后动态计算')
  }
})

// 处理路线规划请求
const handleRoutePlanning = async () => {
  try {
    const route = useRoute()
    const planRouteId = route?.query?.planRoute
    
    if (planRouteId) {
      console.log('需要规划路线到站点:', planRouteId)
      const station = stationStore.getStationById(planRouteId)
      if (station) {
        await nextTick()
        if (mapRef.value) {
          mapRef.value.planRouteToStation(station.stationId)
        }
      }
    }
  } catch (error) {
    console.error('路线规划处理失败:', error)
  }
}
</script>

<style scoped>
/* 移动端容器 */
.mobile-container {
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部搜索栏 */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-container {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(8, 28, 84, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #081c54;
  font-size: 18px;
  transition: all 0.3s ease;
}

.action-btn:active {
  background: rgba(8, 28, 84, 0.2);
  transform: scale(0.95);
}

/* 全屏地图 */
.map-fullscreen {
  position: fixed; /* 固定定位，不受页面滚动影响 */
  top: 60px; /* 距离顶部60px（搜索栏高度） */
  left: 0;
  right: 0;
  bottom: 16.67vh; /* 距离底部16.67vh（收起状态高度） */
  height: calc(100vh - 60px - 16.67vh); /* 固定高度：屏幕高度 - 顶部搜索栏 - 收起状态 */
  overflow: hidden; /* 禁用滚动 */
  z-index: 1; /* 确保在地图内容之上 */
}

/* 底部卡片 */
.bottom-card {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 999;
  transition: all 0.3s ease;
  overflow: hidden;
  touch-action: none; /* 禁用默认触摸行为 */
  -webkit-touch-callout: none; /* 禁用iOS长按菜单 */
  -webkit-user-select: none; /* 禁用文本选择 */
  user-select: none;
}

/* 拖拽时的样式 */
.bottom-card.dragging {
  transition: none; /* 拖拽时禁用过渡动画 */
}

.bottom-card.card-expanded {
  max-height: 75vh; /* 详情状态：四分之三屏幕 */
}

.bottom-card.list-expanded {
  max-height: 75vh; /* 列表状态：四分之三屏幕 */
}

.bottom-card.card-collapsed {
  max-height: 16.67vh; /* 收起状态：六分之一屏幕 (100/6) */
  min-height: 16.67vh;
}

.card-handle {
  padding: 12px 0 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
  min-height: 60px;
  touch-action: none; /* 禁用默认触摸行为 */
  -webkit-touch-callout: none; /* 禁用iOS长按菜单 */
  -webkit-user-select: none; /* 禁用文本选择 */
}

.card-handle:hover {
  background: rgba(0, 0, 0, 0.02);
}

.card-handle:active {
  background: rgba(0, 0, 0, 0.05);
}

/* 拖拽时的滑条样式 */
.bottom-card.dragging .card-handle {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(1.02);
}

.handle-bar {
  width: 50px;
  height: 5px;
  background: #d0d0d0;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.card-handle:hover .handle-bar {
  background: #b0b0b0;
}

/* 拖拽时的滑条样式 */
.bottom-card.dragging .handle-bar {
  background: #999;
  transform: scale(1.1);
}

.handle-text {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  opacity: 0.9;
  font-weight: 500;
}

.collapsed-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0 8px;
  color: #999;
  font-size: 11px;
  gap: 2px;
}

/* 收起预览区样式 */
.collapsed-preview {
  padding: 6px 12px 12px;
}

.collapsed-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
}

.collapsed-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collapsed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f8fa;
}

.collapsed-item-left {
  min-width: 0;
}

.collapsed-name {
  font-size: 14px;
  font-weight: 600;
  color: #081c54;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapsed-sub {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapsed-item-right {
  text-align: right;
}

.collapsed-distance {
  font-size: 12px;
  color: #333;
}

.collapsed-availability {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 2px;
}

.collapsed-availability .c-fast,
.collapsed-availability .c-slow {
  font-size: 12px;
  color: #555;
}

.card-content {
  padding: 0 20px 20px;
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.station-name {
  font-size: 18px;
  font-weight: 600;
  color: #081c54;
  margin: 0;
  flex: 1;
  margin-right: 12px;
}

.station-distance {
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
}

.station-info {
  margin-bottom: 16px;
}

.station-address {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.station-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag.fast-charge {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.tag.slow-charge {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 16px;
  font-weight: 600;
  color: #081c54;
}

.brand {
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 8px;
}

.station-actions {
  display: flex;
  gap: 12px;
}

.station-actions .van-button {
  flex: 1;
}

/* 站点列表 */
.station-list {
  padding: 0 16px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.location-text {
  font-weight: 500;
}

.list-actions {
  display: flex;
  gap: 8px;
}

/* 排序和筛选栏 */
.sort-filter-bar {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.sort-filter-bar .van-dropdown-menu {
  flex: 1;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: none;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
}

/* 站点列表项 */
.station-items {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
  max-height: calc(75vh - 110px); /* 减去头部和筛选栏的高度 */
  -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
}

/* 滚动条样式 */
.station-items::-webkit-scrollbar {
  width: 4px;
}

.station-items::-webkit-scrollbar-track {
  background: transparent;
}

.station-items::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.station-items::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.station-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.station-item:last-child {
  border-bottom: none;
}

.station-item.item-selected {
  background: rgba(8, 28, 84, 0.05);
  border-radius: 8px;
  padding: 16px 12px;
  margin: 0 -12px;
}

.station-item:active {
  background: #f8f9fa;
}

/* 站点标题和标签 */
.item-title {
  margin-bottom: 8px;
}

.station-name {
  font-size: 16px;
  font-weight: 600;
  color: #081c54;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.station-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.tag.star-tag {
  background: #8b4513;
  color: white;
}

.tag.brand-tag {
  background: #e3f2fd;
  color: #1976d2;
}

.tag.discount-tag {
  background: #ffebee;
  color: #d32f2f;
}

/* 价格信息 */
.price-section {
  margin-bottom: 8px;
}

.main-price {
  font-size: 18px;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 2px;
}

.price-breakdown {
  font-size: 12px;
  color: #666;
}

/* 充电桩可用性 */
.availability-section {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.availability-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.label {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 3px;
}

.fast-label {
  background: #e8f5e8;
  color: #2e7d32;
}

.slow-label {
  background: #fff3e0;
  color: #f57c00;
}

.count {
  font-size: 12px;
  color: #666;
}

/* 停车费说明 */
.parking-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #1976d2;
  margin-bottom: 12px;
}

/* 操作按钮 */
.item-actions {
  display: flex;
  gap: 8px;
}

.item-actions .van-button {
  flex: 1;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mobile-header {
    padding: 6px 12px;
  }
  
  .action-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .station-name {
    font-size: 16px;
  }
  
  .station-actions {
    flex-direction: column;
  }
  
  /* 移动端调整底部卡片高度 */
  .bottom-card {
    max-height: 30vh; /* 移动端默认稍大一些 */
  }
  
  .bottom-card.card-expanded,
  .bottom-card.list-expanded {
    max-height: 80vh; /* 移动端列表状态更大 */
  }
  
  .bottom-card.card-collapsed {
    max-height: 20vh; /* 移动端收起状态稍大 */
    min-height: 20vh;
  }
  
  .map-fullscreen {
    bottom: 20vh; /* 移动端距离底部20vh（收起状态） */
    height: calc(100vh - 60px - 20vh); /* 移动端固定高度 */
    overflow: hidden; /* 禁用滚动 */
  }
  
  /* 移动端滚动优化 */
  .station-items {
    max-height: calc(80vh - 110px); /* 移动端滚动区域 */
    padding-bottom: 20px; /* 底部留白 */
  }
  
  .station-item {
    padding: 20px 0; /* 移动端更大的点击区域 */
  }
}
</style>