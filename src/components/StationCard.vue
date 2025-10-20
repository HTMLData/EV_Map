<template>
  <div class="station-card" :class="{ 'card-selected': isSelected }">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="station-info">
        <h3 class="station-name">{{ station.stationName }}</h3>
        <div class="station-status" :class="getStatusClass(station.openStatus)">
          {{ station.openStatus === 1 ? '营业中' : '暂停营业' }}
        </div>
      </div>
      <div class="station-distance">
        <van-icon name="location" size="14" />
        <span>{{ station.distance ? station.distance + 'km' : '定位中...' }}</span>
      </div>
    </div>

    <!-- 地址信息 -->
    <div class="station-address">
      <van-icon name="map-marked" size="14" />
      <span>{{ station.address }}</span>
    </div>

    <!-- 充电桩详情 -->
    <div class="station-details">
      <div class="detail-row">
        <div class="detail-item">
          <span class="label">价格</span>
          <span class="value">¥{{ station.totalCostPrice }}/kWh</span>
        </div>
        <div class="detail-item">
          <span class="label">快充</span>
          <span class="value">{{ station.quickAvailableNum }}/{{ station.quickChargeNum }}</span>
        </div>
      </div>
      <div class="detail-row">
        <div class="detail-item">
          <span class="label">慢充</span>
          <span class="value">{{ station.slowAvailableNum }}/{{ station.slowChargeNum }}</span>
        </div>
        <div class="detail-item">
          <span class="label">营业时间</span>
          <span class="value">{{ station.openTime }}</span>
        </div>
      </div>
    </div>

    <!-- 品牌信息 -->
    <div class="station-brand">
      <span class="brand-tag">{{ station.brandName }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <van-button 
        type="primary" 
        size="small" 
        @click="handleViewDetail"
        class="action-btn"
      >
        查看详情
      </van-button>
      <van-button 
        type="default" 
        size="small" 
        @click="handleNavigate"
        class="action-btn"
      >
        导航前往
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  station: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'navigate'])
const router = useRouter()

const isSelected = computed(() => props.selected)

const getStatusClass = (openStatus) => {
  return openStatus === 1 ? 'status-open' : 'status-closed'
}

const handleViewDetail = () => {
  emit('select', props.station)
  router.push(`/station/${props.station.stationId}`)
}

const handleNavigate = () => {
  emit('navigate', props.station)
  router.push({ 
    path: '/', 
    query: { 
      planRoute: props.station.stationId, 
      stationName: props.station.stationName 
    } 
  })
}
</script>

<style scoped>
.station-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.station-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: rgba(8, 28, 84, 0.2);
}

.station-card.card-selected {
  background: rgba(8, 28, 84, 0.05);
  border-color: #081c54;
  box-shadow: 0 4px 16px rgba(8, 28, 84, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.station-info {
  flex: 1;
}

.station-name {
  font-size: 16px;
  font-weight: 600;
  color: #081c54;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.station-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.station-status.status-open {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
  border: 1px solid rgba(52, 199, 89, 0.2);
}

.station-status.status-closed {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.2);
}

.station-distance {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 12px;
  font-weight: 500;
}

.station-address {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 12px;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

.station-details {
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  flex: 1;
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

.station-brand {
  margin-bottom: 16px;
}

.brand-tag {
  padding: 4px 8px;
  background: rgba(8, 28, 84, 0.1);
  border-radius: 6px;
  font-size: 10px;
  color: #081c54;
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  border-radius: 8px;
  font-weight: 500;
}

.action-btn:first-child {
  background: #081c54;
  border-color: #081c54;
}

.action-btn:first-child:hover {
  background: #0a2468;
  border-color: #0a2468;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .station-card {
    padding: 12px;
  }
  
  .station-name {
    font-size: 14px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .card-actions {
    flex-direction: column;
  }
}
</style>
