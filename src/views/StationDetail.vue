<template>
  <div class="detail-container">
    <!-- 顶部导航与标题 -->
    <div class="detail-header">
      <div class="back" @click="goBack">
        <van-icon name="arrow-left" />
      </div>
      <div class="title">站点详情</div>
    </div>

    <!-- 顶部图片轮播 -->
    <div class="banner">
      <van-skeleton :row="3" :loading="loading">
        <van-swipe v-if="detail?.pictures?.length" class="banner-swipe" :autoplay="3000" indicator-color="#1989fa">
          <van-swipe-item v-for="(pic, idx) in detail.pictures" :key="idx">
            <img class="banner-img" :src="pic" alt="station" />
          </van-swipe-item>
        </van-swipe>
        <div v-else class="banner-placeholder">{{ errorMsg || '暂无图片' }}</div>
      </van-skeleton>
          </div>

    <!-- 主体卡片内容 -->
    <div class="content">
      <!-- 基本信息区 -->
      <div class="card">
        <div class="card-title">
          <div class="name">{{ detail?.stationName || '-' }}</div>
        </div>
        <div class="meta">
          <div class="meta-item">
            <van-icon name="location-o" />
            <span>{{ detail?.address || '-' }}</span>
          </div>
          <div class="meta-item">
            <van-icon name="clock-o" />
            <span>{{ detail?.busineHours || '营业时间暂无' }}</span>
          </div>
          <div class="meta-item" v-if="detail?.serviceTel">
            <van-icon name="phone-o" />
            <a class="tel" :href="`tel:${detail.serviceTel}`">{{ detail.serviceTel }}</a>
          </div>
        </div>
        <div class="fee" v-if="detail?.parkFee">
          <van-icon name="info-o" />
          <span>{{ detail.parkFee }}</span>
        </div>
      </div>

      <!-- 充电车位区（快/慢充枪） -->
      <div class="card">
        <div class="section-header">充电车位</div>
        <!-- 快充分组 -->
        <div class="connector-group" v-if="detail?.fastConnectors?.length">
          <div class="group-header" @click="expandFast = !expandFast">
            <div class="group-title">快充</div>
            <div class="group-meta">
              <span class="badge">{{ detail.fastConnectors.length }}</span>
              <van-icon :name="expandFast ? 'arrow-up' : 'arrow-down'" />
            </div>
          </div>
          <div class="connector-list" v-show="expandFast">
            <div class="connector-item" v-for="c in detail.fastConnectors" :key="c.connectorId">
              <div class="c-left">
                <div class="c-name">{{ c.connectorName || ('#' + c.connectorId) }}</div>
                <div class="c-sub">{{ c.power || '-' }}</div>
              </div>
              <div class="c-right" :class="statusClass(c.status)">{{ c.status }}</div>
            </div>
          </div>
        </div>
        <!-- 慢充分组 -->
        <div class="connector-group" v-if="detail?.slowConnectors?.length">
          <div class="group-header" @click="expandSlow = !expandSlow">
            <div class="group-title">慢充</div>
            <div class="group-meta">
              <span class="badge">{{ detail.slowConnectors.length }}</span>
              <van-icon :name="expandSlow ? 'arrow-up' : 'arrow-down'" />
            </div>
          </div>
          <div class="connector-list" v-show="expandSlow">
            <div class="connector-item" v-for="c in detail.slowConnectors" :key="c.connectorId">
              <div class="c-left">
                <div class="c-name">{{ c.connectorName || ('#' + c.connectorId) }}</div>
                <div class="c-sub">{{ c.power || '-' }}</div>
              </div>
              <div class="c-right" :class="statusClass(c.status)">{{ c.status }}</div>
          </div>
          </div>
        </div>
      </div>

      <!-- 分时价格区 -->
      <div class="card">
        <div class="section-header price-header" @click="expandPrices = !expandPrices">
          分时价格
          <div class="time-range" v-if="detail?.busineHours">{{ detail.busineHours }}</div>
          <div class="price-toggle">
            <span class="toggle-text">{{ expandPrices ? '收起' : '展开' }}</span>
            <van-icon :name="expandPrices ? 'arrow-up' : 'arrow-down'" />
          </div>
        </div>
        <div class="price-table" v-if="detail?.periodPrices?.length">
          <div class="price-th">
            <div>时段</div>
            <div>电价(元/度)</div>
          </div>
          <div class="price-tr" v-for="(p, i) in displayPeriodPrices" :key="i">
            <div>{{ p.startTime }} - {{ p.endTime }}</div>
            <div>
              <span v-if="p.price !== undefined">¥{{ Number(p.price).toFixed(2) }}</span>
              <span v-else>¥{{ Number(p.totalFee || (Number(p.eleFee || 0) + Number(p.serviceFee || 0))).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="empty" v-else>暂无分时价格</div>
        <div class="collapse-hint" v-if="!expandPrices && detail?.periodPrices?.length">仅显示当前时段，点击标题可展开全部</div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <van-button round type="primary" plain class="left-btn" @click="startCharging">开始充电</van-button>
      <van-button round type="primary" class="right-btn" @click="navigate">导航前往</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { stationAPI } from '../api/stationService'
import { useBusinessStore } from '../stores/businessStore'

const route = useRoute()
const router = useRouter()
const businessStore = useBusinessStore()

const loading = ref(true)
const detail = ref(null)
const errorMsg = ref('')
const expandFast = ref(false)
const expandSlow = ref(false)
const expandPrices = ref(false)

// 仅显示当前时段；展开后显示全部
const displayPeriodPrices = computed(() => {
  if (!detail.value?.periodPrices?.length) return []
  if (expandPrices.value) return detail.value.periodPrices
  const now = new Date()
  const current = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  // 找到 currentFlag 或者时间命中的时段；否则返回第一条
  const list = detail.value.periodPrices
  const currentItem = list.find(p => p.currentFlag) || list.find(p => current >= p.startTime && current < p.endTime) || list[0]
  return [currentItem]
})

// 拉取详情（从 public/mock/stationDetail.json 中按 stationId 匹配）
const fetchDetail = async () => {
  try {
    const id = String(route.params.id)
    const res = await stationAPI.getStationDetail(id)
    if (!res) {
      errorMsg.value = '未找到该充电站详情'
    }
    detail.value = res
  } catch (e) {
    errorMsg.value = '加载详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const navigate = () => {
  if (!detail.value) return
  // 直接唤起地图App：通过 Home 中的 MapView 暴露的方法
  const home = window?.app?.$refs?.homeMapRef // 若没有全局引用，使用路由返回后触发
  if (home && home.openAmapNavigation) {
    home.openAmapNavigation(detail.value.stationId)
  } else {
    // 回退：返回首页后通过 query 触发唤起逻辑（Home收到后openAmapNavigation）
    router.push({ path: '/', query: { navTo: detail.value.stationId } })
  }
}

const startCharging = () => {
  if (!detail.value) return
  import('vant').then(({ showToast }) => showToast({ message: '进入充电会话（模拟）', type: 'success' }))
  router.push(`/charge/${detail.value.stationId}`)
}

const statusClass = (status) => {
  switch (status) {
    case '空闲':
    case '可用':
      return 'status-free'
    case '占用':
    case '忙碌':
      return 'status-busy'
    default:
      return 'status-partial'
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.detail-container { background: #f5f7fa; min-height: 100vh; }
.detail-header { position: sticky; top: 0; height: 48px; display: flex; align-items: center; padding: 0 12px; background: #fff; z-index: 10; border-bottom: 1px solid #eee; }
.detail-header .back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 18px; background: #f2f3f5; }
.detail-header .title { flex: 1; text-align: center; font-weight: 600; color: #111; }

.banner { background: #000; height: 200px; }
.banner-swipe { height: 200px; }
.banner-img { width: 100%; height: 200px; object-fit: cover; }
.banner-placeholder { height: 200px; color: #999; display: flex; align-items: center; justify-content: center; background: #f2f3f5; }

.content { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.card-title { display: flex; align-items: center; justify-content: space-between; }
.name { font-size: 18px; font-weight: 700; color: #111; }
.meta { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.meta-item { display: flex; align-items: center; gap: 6px; color: #555; font-size: 14px; }
.tel { color: #1989fa; text-decoration: none; }
.fee { display: flex; align-items: center; gap: 6px; color: #666; margin-top: 8px; font-size: 13px; }

.section-header { font-weight: 600; color: #111; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; }
.time-range { color: #888; font-size: 12px; }

.connector-group { margin-top: 6px; }
.group-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; cursor: pointer; }
.group-meta { display: flex; align-items: center; gap: 8px; color: #999; }
.badge { background: rgba(0,0,0,.06); color: #666; border-radius: 10px; padding: 2px 8px; font-size: 12px; }
.group-title { color: #081c54; font-weight: 600; margin: 6px 0; }
.connector-list { display: flex; flex-direction: column; gap: 8px; }
.connector-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; background: #f7f8fa; }
.c-left { display: flex; flex-direction: column; }
.c-name { font-weight: 600; color: #111; }
.c-sub { color: #888; font-size: 12px; margin-top: 2px; }
.c-right { padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.c-right.status-free { background: rgba(52,199,89,.12); color: #34c759; }
.c-right.status-partial { background: rgba(255,149,0,.12); color: #ff9500; }
.c-right.status-busy { background: rgba(245,34,45,.12); color: #f5222d; }

.price-table { border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
.price-th, .price-tr { display: grid; grid-template-columns: 1fr 1fr; padding: 10px 12px; }
.price-th { background: #f7f8fa; color: #666; font-size: 12px; }
.price-tr { border-top: 1px solid #f0f0f0; }
.price-header { cursor: pointer; }
.price-toggle { display: flex; align-items: center; gap: 6px; color: #1989fa; }
.toggle-text { font-size: 12px; }
.collapse-hint { margin-top: 8px; color: #999; font-size: 12px; }
.empty { color: #999; font-size: 13px; }

.bottom-actions { position: sticky; bottom: 0; background: #fff; padding: 10px 12px 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; box-shadow: 0 -2px 10px rgba(0,0,0,0.04); }
.left-btn { border-color: #1989fa; color: #1989fa; }
.right-btn { background: linear-gradient(135deg, #081c54, #1989fa); border: none; }
</style>