<template>
  <div class="mobile-container">
    

    <!-- 全屏地图 -->
    <div class="map-fullscreen">
      <MapView
        :stations="searchResults"
        :selected-station-id="selectedStationId"
        @select-station="handleStationSelect"
        @map-click="onMapBlankClick"
        ref="mapRef"
      />
        </div>

    <!-- 右侧浮动按钮：搜索 + 定位 -->
    <button class="floating-search" @click="toggleSearchPanel" :style="searchButtonStyle">
      <van-icon name="search" />
    </button>
    <button class="floating-locate" @click="locateUser" :style="locateButtonStyle">
      <van-icon name="aim" />
    </button>

    <!-- 点击遮罩：点击任意处可关闭搜索面板 -->
    <div v-if="showSearchPanel" class="floating-search-mask" @click="toggleSearchPanel"></div>

    <!-- 搜索展开面板（定位按钮正上方） -->
    <div v-if="showSearchPanel" class="floating-search-panel" @click.stop :style="searchPanelStyle">
      <van-search
        v-model="searchQuery"
        placeholder="搜索充电桩名称或地址"
        @search="handleSearch"
        @clear="handleClearSearch"
        @input="handleSearchInput"
        shape="round"
        background="#fff"
        clearable
        show-action
        action-text="关闭"
        @cancel="toggleSearchPanel"
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
        <div class="handle-text" v-if="cardCollapsed">上滑查看充电桩详情</div>
      </div>

      <!-- 收起预览区（下拉后显示前两条简要信息） -->
      <div class="collapsed-preview" v-if="cardCollapsed">
        <div class="collapsed-title">
          <van-icon name="location-o" />
          <span>结果</span>
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
        <div v-if="searchQuery && collapsedPreviewStations.length === 0" class="collapsed-empty">未找到匹配站点</div>
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
                <div class="list-header" ref="listHeaderRef">
          <div class="location-info">
            <van-icon name="location-o" />
            <span class="location-text">附近推荐</span>
              </div>
          <div class="list-actions">
            <button class="action-btn" @click="refreshList" title="清除搜索并刷新">
              <van-icon name="replay" />
            </button>
            <button class="action-btn" @click="collapseCard">
              <van-icon name="cross" />
            </button>
            </div>
          </div>

        <!-- 排序和筛选栏 -->
        <div class="sort-filter-bar" ref="sortFilterRef">
          <div class="dropdown-section">
            <!-- 自定义排序下拉菜单 -->
            <div class="custom-dropdown" :class="{ 'active': showSortDropdown }">
              <div class="dropdown-trigger" @click="toggleSortDropdown">
                <span>{{ getSortText(sortType) }}</span>
                <van-icon name="arrow-down" :class="{ 'rotated': showSortDropdown }" />
              </div>
              <div class="dropdown-content" v-show="showSortDropdown">
                <div 
                  v-for="option in sortOptions" 
                  :key="option.value"
                  class="dropdown-item"
                  :class="{ 'selected': sortType === option.value }"
                  @click="selectSortOption(option.value)"
                >
                  {{ option.text }}
                </div>
              </div>
            </div>

            <!-- 自定义距离筛选下拉菜单 -->
            <div class="custom-dropdown" :class="{ 'active': showDistanceDropdown }">
              <div class="dropdown-trigger" @click="toggleDistanceDropdown">
                <span>{{ getDistanceText(distanceFilter) }}</span>
                <van-icon name="arrow-down" :class="{ 'rotated': showDistanceDropdown }" />
              </div>
              <div class="dropdown-content" v-show="showDistanceDropdown">
                <div 
                  v-for="option in distanceOptions" 
                  :key="option.value"
                  class="dropdown-item"
                  :class="{ 'selected': distanceFilter === option.value }"
                  @click="selectDistanceOption(option.value)"
                >
                  {{ option.text }}
                </div>
              </div>
            </div>
          </div>
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
            @click="openStationFromList(station)"
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
const showSearch = ref(false)
const showSearchPanel = ref(false)
const selectedStationId = ref(null)
const selectedStation = ref(null)
const mapRef = ref(null)
const stationListRef = ref(null)
const listHeaderRef = ref(null)
const sortFilterRef = ref(null)
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
const distanceFilter = ref('all')

// 下拉菜单状态
const showSortDropdown = ref(false)
const showDistanceDropdown = ref(false)

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
  { text: '不限', value: 'all' },
  { text: '1KM', value: '1km' },
  { text: '3KM', value: '3km' },
  { text: '5KM', value: '5km' },
  { text: '10KM', value: '10km' }
]

// 计算搜索结果
const searchResults = computed(() => {
  let results = stationStore.filteredStations
  
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

  // 距离筛选（不限时不限制）
  if (distanceFilter.value && distanceFilter.value !== 'all') {
    const kmLimit = parseFloat(distanceFilter.value)
    if (!Number.isNaN(kmLimit)) {
      results = results.filter(station => {
        const d = station.distance
        return typeof d === 'number' && d <= kmLimit
      })
    }
  }

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
watch(() => stationStore.stations, () => {}, { deep: true })

watch(() => searchResults.value, () => {}, { deep: true })

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

const handleSearch = () => {}

const handleClearSearch = () => {
  searchQuery.value = ''
}

const handleSearchInput = () => {
  // 实时搜索逻辑
}

// 收起预览：
// - 若有搜索词，展示最匹配的 1 条
// - 否则展示附近推荐前 2 条
const collapsedPreviewStations = computed(() => {
  if (searchQuery.value && searchQuery.value.trim().length > 0) {
    const best = sortedStations.value[0]
    return best ? [best] : []
  }
  return sortedStations.value.slice(0, 2)
})

// 从预览展开并聚焦站点
const expandFromPreview = (station) => {
  // 若处于检索模式，点击仅定位到该点，并保持底部栏收起
  if (searchQuery.value && searchQuery.value.trim().length > 0) {
    selectedStationId.value = station.stationId
    selectedStation.value = station
    businessStore.selectStation(station)
    if (mapRef.value && mapRef.value.flyToStation) {
      mapRef.value.flyToStation(station)
    }
    return
  }
  // 非检索模式：展开列表
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

// 搜索/定位按钮随底部卡片拖拽的动态样式
const searchButtonStyle = computed(() => {
  const collapsedH = window.innerHeight * 0.1667
  const expandedH = window.innerHeight * 0.75
  const h = currentCardHeight.value
  const gap = 12
  // 初始固定：位于定位按钮之上 56px
  const baseBottom = 20 + (window.innerHeight * 0.20) + 56
  // 当列表上边框 + gap 超过基准点时才开始跟随
  const threshold = baseBottom - gap
  const borderBottom = h
  const bottom = borderBottom + gap > threshold ? borderBottom + gap : baseBottom
  return { bottom: bottom + 'px' }
})

const locateButtonStyle = computed(() => {
  const collapsedH = window.innerHeight * 0.1667
  const expandedH = window.innerHeight * 0.75
  const h = currentCardHeight.value
  const t = (h - collapsedH) / (expandedH - collapsedH) // 0(收起)~1(展开)
  const opacity = String(Math.max(0, Math.min(1, 1 - t)))
  // 定位按钮始终贴着列表上边框下方 12px（视觉更近），但保持在卡片区域外：这里固定使用收起时的原始位置
  const baseBottom = 20 + (window.innerHeight * 0.20)
  return { bottom: baseBottom + 'px', opacity }
})

// 计算当前底部卡片高度：跟随拖拽并夹在收起/展开之间
const currentCardHeight = computed(() => {
  const collapsedH = window.innerHeight * 0.1667
  const expandedH = window.innerHeight * 0.75
  let h = cardCollapsed.value ? collapsedH + Math.max(cardDragOffset.value, 0)
                              : expandedH + Math.min(cardDragOffset.value, 0)
  if (h < collapsedH) h = collapsedH
  if (h > expandedH) h = expandedH
  return h
})

// 列表内容区域的固定高度（避免因结果条数变化而抖动）
const listContentHeight = computed(() => {
  const expandedH = window.innerHeight * 0.75
  const headerH = listHeaderRef.value ? listHeaderRef.value.offsetHeight : 56
  const filterH = sortFilterRef.value ? sortFilterRef.value.offsetHeight : 54
  const padding = 20 + 8 // station-list padding-bottom + station-items padding-top
  return Math.max(120, Math.round(expandedH - headerH - filterH - padding))
})

// 搜索面板与搜索按钮同步：在列表边框“碰到”按钮前不移动；碰到后一起移动
const searchPanelStyle = computed(() => {
  // 让面板与搜索按钮保持固定间距（按钮上方 8px）
  const btnBottom = parseFloat(searchButtonStyle.value.bottom)
  const bottom = btnBottom + 8 + 52 // 52 为面板内部视觉的偏移近似
  return { bottom: bottom + 'px' }
})

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
      expandCard()
    } else if (!cardCollapsed.value && cardDragOffset.value < -threshold) {
      // 从展开状态向下拖拽超过阈值，收起
      collapseCard()
    } else {
      // 拖拽距离不够，回弹到原状态
      resetCardPosition()
    }
  } else {
    // 拖拽距离不够，回弹到原状态
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

// 列表项点击：先高亮并飞行，再进入详情
const openStationFromList = (station) => {
  selectStationFromList(station)
  router.push(`/station/${station.stationId}`)
}

const handleSortChange = (value) => {
  sortType.value = value
}

const handleDistanceFilter = (value) => {
  distanceFilter.value = value
}

// 自定义下拉菜单方法
const toggleSortDropdown = () => {
  showSortDropdown.value = !showSortDropdown.value
  showDistanceDropdown.value = false // 关闭另一个下拉菜单
}

const toggleDistanceDropdown = () => {
  showDistanceDropdown.value = !showDistanceDropdown.value
  showSortDropdown.value = false // 关闭另一个下拉菜单
}

const selectSortOption = (value) => {
  sortType.value = value
  showSortDropdown.value = false
}

const selectDistanceOption = (value) => {
  distanceFilter.value = value
  showDistanceDropdown.value = false
}

const getSortText = (value) => {
  const option = sortOptions.find(opt => opt.value === value)
  return option ? option.text : '距离优先'
}

const getDistanceText = (value) => {
  const option = distanceOptions.find(opt => opt.value === value)
  return option ? option.text : '不限'
}

const sendToCar = (station) => {
  // 实现发送到车的逻辑
}

const navigateToStation = (station) => {
  if (mapRef.value && mapRef.value.openAmapNavigation) {
    mapRef.value.openAmapNavigation(station.stationId)
  }
}

const goToStationDetail = (stationId) => {
  router.push(`/station/${stationId}`)
}

const planRouteToStation = (stationId) => {
  // 规划路线逻辑
}

const goToFilterPage = () => {
  router.push('/filter')
}

// 地图空白区域点击：当列表已展开时收起
const onMapBlankClick = () => {
  if (!cardCollapsed.value && showStationList.value) {
    collapseCard()
  }
}

// 顶部定位按钮：调用子组件 MapView 的定位方法
const locateUser = () => {
  if (mapRef.value && mapRef.value.locateUser) {
    mapRef.value.locateUser()
  }
}

const hideSearch = () => {
  showSearch.value = false
  searchQuery.value = ''
}

const toggleSearchPanel = () => {
  showSearchPanel.value = !showSearchPanel.value
}

// 刷新列表：清除搜索条件，收起搜索面板并回到推荐列表
const refreshList = async () => {
  searchQuery.value = ''
  showSearch.value = false
  showSearchPanel.value = false
  // 重新触发计算属性，无需强制刷新；如需重载数据可调用：
  // await stationStore.fetchStations()
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
  
  await stationStore.fetchStations()
  
  // 检查是否需要规划路线
  await handleRoutePlanning()

  // 检查是否来自详情的App导航请求
  const navTo = route?.query?.navTo
  if (navTo && mapRef.value && mapRef.value.openAmapNavigation) {
    mapRef.value.openAmapNavigation(String(navTo))
    // 清除query，避免再次触发
    router.replace({ path: route.path })
  }

  // 监听点击外部关闭搜索面板和下拉菜单
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container') && !e.target.closest('.floating-search')) {
      showSearchPanel.value = false
    }
    if (!e.target.closest('.custom-dropdown')) {
      showSortDropdown.value = false
      showDistanceDropdown.value = false
    }
  })
  
  // 调试信息：显示距离计算状态
  if (stationStore.userLocation) {
  } else {
  }
})

// 处理路线规划请求
const handleRoutePlanning = async () => {
  try {
    const route = useRoute()
    const planRouteId = route?.query?.planRoute
    
    if (planRouteId) {
      const station = stationStore.getStationById(planRouteId)
      if (station) {
        await nextTick()
        if (mapRef.value) {
          mapRef.value.planRouteToStation(station.stationId)
        }
      }
    }
  } catch (error) {
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

/* 顶部 mobile-header 已移除 */

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(8, 28, 84, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #081c54;
  font-size: 16px;
  transition: all 0.3s ease;
}

/* 右侧浮动定位按钮 */
.floating-locate {
  position: fixed;
  right: 14px;
  bottom: calc(20vh + 24px);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(8, 28, 84, 0.72); /* 增加透明度 */
  color: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(8, 28, 84, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.floating-locate :deep(.van-icon) { font-size: 18px; }

/* 与定位按钮一致的搜索按钮（圆角正方形），位于定位按钮正上方 */
.floating-search {
  position: fixed;
  right: 14px;
  bottom: calc(20vh + 24px + 56px); /* 初始：位于定位按钮上方 56px */
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(8, 28, 84, 0.72);
  color: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(8, 28, 84, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1400; /* 高于把手与卡片，确保可点击 */
}

.floating-search :deep(.van-icon) { font-size: 18px; }

/* 搜索展开面板，定位于搜索按钮正上方 */
.floating-search-panel {
  position: fixed;
  right: 14px;
  bottom: calc(20vh + 24px + 56px + 60px); /* 与按钮保持约 8px + 52px 面板内部偏移 */
  width: min(76vw, 320px);
  background: rgba(255,255,255,0.96);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(8, 28, 84, 0.18);
  padding: 8px;
  z-index: 1200;
}

/* 搜索面板点击关闭遮罩 */
.floating-search-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.02);
  z-index: 1199;
}

.action-btn:active {
  background: rgba(8, 28, 84, 0.2);
  transform: scale(0.95);
}

/* 全屏地图 */
.map-fullscreen {
  position: fixed; /* 固定定位，不受页面滚动影响 */
  top: 0px; /* 距离顶部60px（搜索栏高度） */
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
  z-index: 1100; /* 高于定位按钮，确保上拉后不被覆盖 */
  transition: all 0.3s ease;
  overflow: hidden;
  touch-action: none; /* 禁用默认触摸行为 */
  -webkit-touch-callout: none; /* 禁用iOS长按菜单 */
  -webkit-user-select: none; /* 禁用文本选择 */
  user-select: none;
}

/* 排序筛选栏允许下拉菜单显示 */
.sort-filter-bar {
  overflow: visible !important;
}

/* 拖拽时的样式 */
.bottom-card.dragging {
  transition: none; /* 拖拽时禁用过渡动画 */
}

.bottom-card.card-expanded {
  max-height: 75vh; /* 详情状态：四分之三屏幕 */
  min-height: 75vh;
}

.bottom-card.list-expanded {
  max-height: 75vh; /* 列表状态：四分之三屏幕 */
  min-height: 75vh;
}

.bottom-card.card-collapsed {
  max-height: 16.67vh; /* 收起状态：六分之一屏幕 (100/6) */
  min-height: 16.67vh;
}

.card-handle {
  padding: 12px 0 0px;
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

.collapsed-empty { color: #999; font-size: 12px; text-align: center; padding: 8px 0; }

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
  position: relative;
  z-index: 1200;
}

.dropdown-section {
  flex: 1;
  display: flex;
  gap: 8px;
}

/* 自定义下拉菜单样式 */
.custom-dropdown {
  position: relative;
  flex: 1;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
}

.dropdown-trigger:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.dropdown-trigger .van-icon {
  transition: transform 0.2s ease;
  font-size: 12px;
  color: #666;
}

.dropdown-trigger .van-icon.rotated {
  transform: rotate(180deg);
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1300;
  margin-top: 2px;
  overflow: hidden;
}

.dropdown-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.selected {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
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
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #e9ecef;
}

/* 站点列表项 */
.station-items {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
  height: calc(75vh - 110px); /* 将可视区域锁定为固定高度，不随内容条数变化 */
  min-height: calc(75vh - 110px);
  max-height: calc(75vh - 110px);
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