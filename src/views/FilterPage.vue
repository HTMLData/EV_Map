<template>
  <div class="volkswagen-filter-container">
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
      <!-- 筛选器 -->
      <div class="volkswagen-filters">
        <div class="filter-group">
          <label>充电类型</label>
          <div class="filter-options">
            <div
              v-for="(type, index) in chargeTypes"
              :key="type.value"
              class="filter-chip"
              :class="{ 
                active: stationStore.filterOptions.type === type.value
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
                active: stationStore.filterOptions.status === status.value
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
                active: stationStore.filterOptions.sortBy === sort.value
              }"
              @click="setFilter('sortBy', sort.value)"
            >
              {{ sort.label }}
            </div>
          </div>
        </div>
        
        <!-- 搜索框 -->
        <div class="filter-group search-group">
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
      <div class="station-list-container">
        <div class="list-header">
          <span class="count">{{ searchResults.length }} 个充电桩</span>
        </div>
        <div class="station-list">
          <div
            v-for="(station, index) in searchResults"
            :key="station.id"
            class="volkswagen-station-item"
            @click="selectStation(station)"
          >
            <div class="station-info">
              <div class="station-header">
                <h3 class="station-name">{{ station.name }}</h3>
                <div class="status-badge" :class="getStatusClass(station.status)">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStationStore } from '../stores/stationStore'
import { useBusinessStore } from '../stores/businessStore'
import CustomIcon from '../components/CustomIcon.vue'

const router = useRouter()
const stationStore = useStationStore()
const businessStore = useBusinessStore()

// 响应式数据
const searchQuery = ref('')

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
const goBack = () => {
  router.back()
}

const selectStation = (station) => {
  businessStore.selectStation(station)
  router.push(`/station/${station.id}`)
}

const setFilter = (type, value) => {
  stationStore.updateFilter(type, value)
}

const getStatusClass = (status) => {
  switch (status) {
    case '空闲': return 'status-free'
    case '部分空闲': return 'status-partial'
    case '繁忙': return 'status-busy'
    default: return ''
  }
}

// 生命周期
onMounted(async () => {
  // 确保充电桩数据已加载
  if (stationStore.stations.length === 0) {
    await stationStore.fetchStations()
  }
  console.log('筛选页面充电桩数据:', stationStore.stations.length)
})
</script>

<style scoped>
/* 大众品牌风格筛选页面 */
.volkswagen-filter-container {
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
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(8, 28, 84, 0.1);
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
  gap: 2px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #081c54;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  padding-top: 80px;
  padding: 80px 20px 20px;
  max-width: 500px;
  margin: 0 auto;
}

/* 筛选器 */
.volkswagen-filters {
  margin-bottom: 24px;
}

/* 搜索框样式 */
.search-container {
  position: relative;
}

.volkswagen-search {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  font-size: 16px;
  color: #081c54;
  transition: all 0.3s ease;
}

.volkswagen-search:focus {
  outline: none;
  border-color: #081c54;
  box-shadow: 0 2px 8px rgba(8, 28, 84, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin-bottom: 12px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  font-size: 14px;
  color: #081c54;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-chip.active {
  background: #081c54;
  border-color: #081c54;
  color: #fff;
  box-shadow: 0 2px 10px rgba(8, 28, 84, 0.2);
}

/* 充电桩列表 */
.station-list-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.list-header {
  margin-bottom: 16px;
}

.count {
  font-size: 16px;
  font-weight: 600;
  color: #081c54;
}

.station-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.volkswagen-station-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.volkswagen-station-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-free {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.status-partial {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.status-busy {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
}

.station-address {
  font-size: 14px;
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
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-content {
    padding: 80px 16px 20px;
  }
  
  .volkswagen-search {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style>
