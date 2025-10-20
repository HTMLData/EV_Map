<template>
  <div class="map-container">
    <!-- 加载状态 -->
    <div v-if="mapLoading" class="map-loading">
      <van-loading type="spinner" size="24px" />
      <span>地图加载中...</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="mapError" class="map-error">
      <van-icon name="warning" size="24px" />
      <span>{{ mapError }}</span>
      <van-button size="small" @click="reloadMap">重新加载</van-button>
    </div>
    
    <!-- 地图容器 -->
    <div id="map" ref="mapContainer" v-show="!mapLoading && !mapError"></div>
    
    
    
    <!-- 清除路线按钮 -->
    <div class="clear-route-btn" @click="clearRoute" v-show="routePolyline && !mapLoading && !mapError">
      <CustomIcon name="clear-route" :size="16" color="#333" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { amapConfig, statusColors } from '../config/amap'
import { useStationStore } from '../stores/stationStore'
import CustomIcon from './CustomIcon.vue'

const props = defineProps({
  stations: {
    type: Array,
    default: () => []
  },
  selectedStationId: {
    type: String,
    default: null
  }
})

// 检测是否为移动端
const isMobile = () => {
  return window.innerWidth <= 768
}

const emit = defineEmits(['select-station', 'map-click'])

const mapContainer = ref(null)
let map = null
let markers = []
let userMarker = null
let geolocation = null // 高德地图定位服务
let driving = null // 驾车路线规划服务
let infoWindow = null // 信息窗口实例
const routePolyline = ref(null) // 路线折线
const router = useRouter()
const mapLoading = ref(true)
const mapError = ref(null)
const stationStore = useStationStore()

// 初始化地图
const initMap = () => {
  // 直接在window上定义初始化函数
  window.initAMap = () => {
    try {
      mapLoading.value = true
      mapError.value = null
      
      // 检查AMap对象是否可用
      if (!window.AMap) {
        throw new Error('AMap对象未定义')
      }
      
      // 检查地图容器是否存在
      const mapContainer = document.getElementById('map')
      if (!mapContainer) {
        throw new Error('地图容器未找到')
      }
      
      
      // 创建地图实例 - 使用配置文件
      map = new window.AMap.Map('map', amapConfig.defaultMapOptions)

    } catch (error) {
      mapError.value = '地图初始化失败: ' + error.message
      mapLoading.value = false
      return
    }
    
    // 异步加载控件
    // 1. 缩放控件已删除（用户要求删除右下角缩放按钮）
    
    // 2. 比例尺控件
    window.AMap.plugin('AMap.Scale', () => {
      const scale = new window.AMap.Scale(amapConfig.controls.scale)
      map.addControl(scale)
    })
    
    // 隐藏默认指南针
    const styleEl = document.createElement('style')
    styleEl.innerHTML = `.amap-controls .amap-compass{display:none!important;}`
    document.head.appendChild(styleEl)
    
    // 3. 定位控件（使用高德地图定位服务）
    window.AMap.plugin('AMap.Geolocation', () => {
      geolocation = new window.AMap.Geolocation(amapConfig.geolocation)
    })
    //不美观、且用处不大删掉
    // 4. 鹰眼控件
    // window.AMap.plugin('AMap.HawkEye', () => {
    //   const hawkEye = new window.AMap.HawkEye({
    //     position: 'LB', // 左下角
    //     show: true, // 显示鹰眼
    //     autoMove: true, // 主图中心点变化时鹰眼自动移动
    //     size: [200, 150] // 鹰眼尺寸
    //   })
    //   map.addControl(hawkEye)
    // })
    
    // 5. 图层切换控件
    // 移除图层切换控件（不加载）

    // 6. 驾车路线规划服务
    window.AMap.plugin('AMap.Driving', () => {
      driving = new window.AMap.Driving({
        map: map,
        showTraffic: false,
        hideMarkers: false,
        autoFitView: true,
        policy: window.AMap.DrivingPolicy.LEAST_TIME
      })
    })

    // 监听地图加载完成
    map.on('complete', () => {
      mapLoading.value = false
      renderMarkers()
      
      // 将路线规划函数暴露到全局
      window.planRouteToStation = planRouteToStation
      window.openAmapNavigation = openAmapNavigation
      window.clearRoute = clearRoute
      
      // 自动执行定位（不显示toast提示）
      setTimeout(() => {
        locateUser(false) // 传入false，不显示toast提示
      }, 1000) // 延迟1秒执行，确保地图完全加载
    })
    
    map.on('error', (error) => {
      mapError.value = '地图加载错误'
      mapLoading.value = false
    })

    // 地图空白区域点击事件（用于通知父组件收起列表）
    map.on('click', () => {
      emit('map-click')
    })
  }
}

// 渲染充电桩标记
const renderMarkers = () => {
  
  // 清除现有标记
  if (markers.length > 0) {
    map.remove(markers)
    markers = []
  }

  // 添加新标记
  props.stations.forEach((station, index) => {
    // 根据状态选择不同的图标
    const statusColor = getStatusColor(station.openStatus)
    const marker = new window.AMap.Marker({
      position: [station.lng, station.lat],
      title: station.stationName,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(44, 44),
        image: createEVMarkerIcon(statusColor, props.selectedStationId === station.stationId, station.quickAvailableNum + station.slowAvailableNum),
        imageSize: new window.AMap.Size(44, 44)
      }),
      extData: { stationId: station.stationId }
    })

    // 设置标记点击事件
    marker.on('click', () => {
      showInfoWindow(station)
      emit('select-station', station)
    })

    // 如果是选中的站点，设置更高的层级
    if (props.selectedStationId === station.stationId) {
      marker.setzIndex(100)
    }

    markers.push(marker)
  })
  
  // 自定义指南针已移除

  // 将标记添加到地图
  if (markers.length > 0) {
    map.add(markers)
  } else {
  }
}

// 自定义指南针与图层控件已移除

// 显示信息窗口
const showInfoWindow = (station) => {
  const statusColor = getStatusColor(station.openStatus)
  const statusText = station.openStatus === 1 ? '营业中' : '暂停营业'
  infoWindow = new window.AMap.InfoWindow({
    content: `
      <div class="volkswagen-info-window">
        <div class="info-header">
          <h3 class="station-title">${station.stationName}</h3>
          <div class="header-right">
            <div class="status-badge" style="background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
              ${statusText}
            </div>
            <button class="close-btn" onclick="window.closeInfoWindow()">×</button>
          </div>
        </div>
        <p class="station-location">${station.address}</p>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">距离</span>
            <span class="value">${station.distance}km</span>
          </div>
          <div class="info-item">
            <span class="label">价格</span>
            <span class="value">¥${station.totalCostPrice}/kWh</span>
          </div>
          <div class="info-item">
            <span class="label">快充</span>
            <span class="value">${station.quickAvailableNum}/${station.quickChargeNum}</span>
          </div>
          <div class="info-item">
            <span class="label">慢充</span>
            <span class="value">${station.slowAvailableNum}/${station.slowChargeNum}</span>
          </div>
        </div>
        <div class="info-actions">
          <button class="volkswagen-btn primary" onclick="window.goToStationDetail('${station.stationId}')">
            查看详情
          </button>
          <button class="volkswagen-btn secondary" onclick="window.openAmapNavigation && window.openAmapNavigation('${station.stationId}')">
            导航前往
          </button>
        </div>
      </div>
    `,
    offset: new window.AMap.Pixel(0, -30),
    isCustom: true,
    closeWhenClickMap: true
  })

  infoWindow.open(map, [station.lng, station.lat])
}

// 规划路线到指定充电桩 - 增强版本（保留供Web预览使用）
const planRouteToStation = (stationId) => {
  
  // 1. 检查驾车服务
  if (!driving) {
    showRouteError('路线规划服务未就绪，请稍后重试')
    return
  }

  // 2. 获取充电桩信息
  const station = stationStore.getStationById(stationId)
  if (!station) {
    showRouteError('未找到充电桩信息')
    return
  }

  // 3. 检查用户位置
  if (!stationStore.userLocation) {
    showRouteError('请先定位获取当前位置')
    return
  }

  
  // 4. 清除之前的路线
  if (routePolyline.value) {
    map.remove(routePolyline.value)
    routePolyline.value = null
  }

  // 5. 创建起点和终点坐标
  const startPoint = new window.AMap.LngLat(
    stationStore.userLocation.longitude, 
    stationStore.userLocation.latitude
  )
  const endPoint = new window.AMap.LngLat(
    station.lng, 
    station.lat
  )

  // 6. 设置超时机制
  const timeoutId = setTimeout(() => {
    showRouteError('路线规划超时，请稍后重试')
  }, 15000) // 15秒超时

  // 7. 执行路线规划
  try {
    driving.search(startPoint, endPoint, (status, result) => {
      clearTimeout(timeoutId) // 清除超时定时器
      
      
      if (status === 'complete') {
        handleRouteSuccess(result, station)
      } else {
        handleRouteError(status, result)
      }
    })
  } catch (error) {
    clearTimeout(timeoutId)
    showRouteError('路线规划服务异常: ' + error.message)
  }
}

// 唤起高德地图App进行导航（优先App，失败回退Web）
const openAmapNavigation = (stationId) => {
  const station = stationStore.getStationById(stationId)
  if (!station) { showRouteError('未找到充电桩信息'); return }
  if (!stationStore.userLocation) { showRouteError('请先定位获取当前位置'); return }

  const sLat = stationStore.userLocation.latitude
  const sLng = stationStore.userLocation.longitude
  const dLat = station.lat
  const dLng = station.lng
  const name = encodeURIComponent(station.stationName || '目的地')

  const ua = navigator.userAgent || ''
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isAndroid = /Android/i.test(ua)

  const iosScheme = `iosamap://path?sourceApplication=EV_Map&slat=${sLat}&slon=${sLng}&dlat=${dLat}&dlon=${dLng}&dev=0&t=0` // t=0 驾车
  const androidScheme = `androidamap://route?sourceApplication=EV_Map&slat=${sLat}&slon=${sLng}&dlat=${dLat}&dlon=${dLng}&dev=0&t=0`
  const webFallback = `https://uri.amap.com/navigation?from=${sLng},${sLat},我的位置&to=${dLng},${dLat},${name}&mode=car&policy=1&src=EV_Map&callnative=1`

  let url = webFallback
  if (isIOS) url = iosScheme
  else if (isAndroid) url = androidScheme

  const openUrl = (u) => { window.location.href = u }
  try {
    openUrl(url)
    // 1.5 秒内未唤起则回退Web
    setTimeout(() => {
      openUrl(webFallback)
    }, 1500)
  } catch (e) {
    openUrl(webFallback)
  }
}

// 处理路线规划成功
const handleRouteSuccess = (result, station) => {
  
  if (result && result.routes && result.routes.length > 0) {
    const route = result.routes[0]
    
    // 显示成功提示
    showRouteSuccess(route.distance, route.time)
    
    // 尝试多种路径数据格式
    let pathData = null
    
    // 方法1: 直接使用route.path
    if (route.path && Array.isArray(route.path) && route.path.length > 0) {
      pathData = route.path
    }
    // 方法2: 使用route.steps中的路径
    else if (route.steps && Array.isArray(route.steps)) {
      const allPaths = []
      route.steps.forEach((step, index) => {
        if (step.path && Array.isArray(step.path)) {
          allPaths.push(...step.path)
        }
      })
      if (allPaths.length > 0) {
        pathData = allPaths
      }
    }
    // 方法3: 使用route.polyline
    else if (route.polyline) {
      try {
        // polyline可能是编码的字符串，需要解码
        if (typeof route.polyline === 'string') {
          // 这里可能需要使用高德地图的polyline解码方法
        } else if (Array.isArray(route.polyline)) {
          pathData = route.polyline
        }
      } catch (error) {
      }
    }
    
    // 绘制路线
    if (pathData && pathData.length > 0) {
      drawRoute(pathData)
    } else {
      showRouteError('无法获取路线路径数据')
    }
  } else {
    showRouteError('路线规划结果无效')
  }
}

// 处理路线规划失败
const handleRouteError = (status, result) => {
  
  let errorMessage = '路线规划失败'
  
  // 根据状态码提供具体错误信息
  switch (status) {
    case 'no_data':
      errorMessage = '无法找到可行路线'
      break
    case 'over_distance':
      errorMessage = '距离过远，无法规划路线'
      break
    case 'engine_fail':
      errorMessage = '路线规划引擎错误'
      break
    case 'network_error':
      errorMessage = '网络连接错误'
      break
    case 'INVALID_USER_SCODE':
      errorMessage = '路线规划功能暂时不可用'
      break
    default:
      errorMessage = `路线规划失败: ${status}`
  }
  
  showRouteError(errorMessage)
}

// 绘制路线
const drawRoute = (path) => {
  
  try {
    // 验证路径数据格式
    if (!Array.isArray(path)) {
      throw new Error('路径数据不是数组格式')
    }
    
    if (path.length === 0) {
      throw new Error('路径数据为空')
    }
    
    // 检查路径点格式
    const firstPoint = path[0]
    if (!firstPoint || typeof firstPoint !== 'object') {
      throw new Error('路径点格式不正确')
    }
    
    // 检查是否有经纬度信息
    if (firstPoint.lng === undefined || firstPoint.lat === undefined) {
      
      // 尝试不同的坐标格式
      if (firstPoint.longitude !== undefined && firstPoint.latitude !== undefined) {
        path = path.map(point => ({
          lng: point.longitude,
          lat: point.latitude
        }))
      } else if (Array.isArray(firstPoint) && firstPoint.length >= 2) {
        path = path.map(point => ({
          lng: point[0],
          lat: point[1]
        }))
      } else {
        throw new Error('无法识别的坐标格式')
      }
    }
    
    
    routePolyline.value = new window.AMap.Polyline({
      path: path,
      strokeColor: '#1989fa',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
      lineJoin: 'round',
      lineCap: 'round'
    })
    
    map.add(routePolyline.value)
    
    // 调整地图视野以显示完整路线
    map.setFitView([routePolyline.value])
    
  } catch (error) {
    showRouteError('绘制路线失败: ' + error.message)
  }
}

// 显示路线规划成功提示
const showRouteSuccess = (distance, time) => {
  import('vant').then(({ showToast }) => {
    showToast({
      message: `路线规划成功\n距离: ${Math.round(distance)}米\n预计时间: ${Math.round(time / 60)}分钟`,
      type: 'success',
      duration: 3000
    })
  })
}

// 显示路线规划错误提示
const showRouteError = (message) => {
  import('vant').then(({ showToast }) => {
    showToast({
      message: message,
      type: 'fail',
      duration: 3000
    })
  })
}

// 清除路线
const clearRoute = () => {
  if (routePolyline.value) {
    map.remove(routePolyline.value)
    routePolyline.value = null
  }
  if (driving) {
    driving.clear()
  }
}

// 触摸事件处理（用于长按检测）
let touchStartTime = 0
let touchTimer = null

const handleTouchStart = () => {
  touchStartTime = Date.now()
  touchTimer = setTimeout(() => {
    // 长按超过1秒，显示权限请求对话框
    requestLocationPermission()
  }, 1000)
}

const handleTouchEnd = () => {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

// 重新请求定位权限
const requestLocationPermission = () => {
  import('vant').then(({ showToast }) => {
    showToast({
      message: '请手动在浏览器设置中开启定位权限，然后刷新页面',
      type: 'loading',
      duration: 3000
    })
    // 延迟1秒后尝试定位
    setTimeout(() => {
      locateUser(true)
    }, 1000)
  })
}

// 定位用户
const locateUser = (showToast = true) => {
  if (!map) {
    return
  }

  
  let toastInstance = null
  
  // 显示定位提示
  if (showToast) {
    import('vant').then(({ showToast }) => {
      toastInstance = showToast({
        message: '正在定位您的位置...',
        type: 'loading',
        duration: 0,
        forbidClick: true
      })
    })
  }
  
  // 设置超时处理
  const timeoutId = setTimeout(() => {
    if (showToast && toastInstance) {
      import('vant').then(({ showToast }) => {
        showToast.clear()
        showToast({
          message: '定位超时，请检查定位权限',
          type: 'fail',
          duration: 3000
        })
      })
    }
  }, 15000) // 15秒超时
  
  // 清除toast的函数
  const clearToast = () => {
    if (showToast && toastInstance) {
      import('vant').then(({ showToast }) => {
        showToast.clear()
      })
    }
    clearTimeout(timeoutId)
  }
  
  // 优先使用高德地图定位服务
  if (geolocation) {
    geolocation.getCurrentPosition((status, result) => {
      clearTimeout(timeoutId)
      
      if (status === 'complete') {
        const { lng, lat } = result.position
        const userPosition = [lng, lat]
        
        // 创建用户位置标记
        createUserMarker(userPosition)
        
        // 移动地图到用户位置
        map.setCenter(userPosition)
        map.setZoom(16) // 设置合适的缩放级别
        
        // 更新stationStore中的用户位置，触发距离重新计算
        stationStore.setUserLocation(lat, lng)
        
        // 显示成功提示
        clearToast()
        if (showToast) {
          import('vant').then(({ showToast }) => {
            showToast({
              message: '定位成功',
              type: 'success',
              duration: 1500
            })
          })
        }
      } else {
        clearToast()
        
        // 高德地图定位失败，尝试浏览器原生定位
        tryBrowserGeolocation(showToast, clearToast, timeoutId)
      }
    })
  } else {
    tryBrowserGeolocation(showToast, clearToast, timeoutId)
  }
}

// 浏览器原生定位（备用方法）
const tryBrowserGeolocation = (showToast, clearToast, timeoutId) => {
  // 检查浏览器是否支持定位
  if (!navigator.geolocation) {
    clearToast()
    if (showToast) {
      import('vant').then(({ showToast }) => {
        showToast({
          message: '浏览器不支持定位功能',
          type: 'fail',
          duration: 3000
        })
      })
    }
    return
  }
  
  // 使用浏览器原生定位API
  navigator.geolocation.getCurrentPosition(
    (position) => {
      clearTimeout(timeoutId)
      const { latitude, longitude } = position.coords
      const userPosition = [longitude, latitude]
      
      // 创建用户位置标记
      createUserMarker(userPosition)
      
      // 移动地图到用户位置
      map.setCenter(userPosition)
      map.setZoom(16) // 设置合适的缩放级别
      
      // 更新stationStore中的用户位置，触发距离重新计算
      stationStore.setUserLocation(latitude, longitude)
      
      // 显示成功提示
      clearToast()
      if (showToast) {
        import('vant').then(({ showToast }) => {
          showToast({
            message: '定位成功',
            type: 'success',
            duration: 1500
          })
        })
      }
    },
    (error) => {
      clearTimeout(timeoutId)
      
      let errorMessage = '定位失败'
      let showPermissionGuide = false
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '定位权限被拒绝'
          showPermissionGuide = true
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = '定位信息不可用'
          break
        case error.TIMEOUT:
          errorMessage = '定位请求超时'
          break
        default:
          errorMessage = '定位失败，请检查网络连接'
          break
      }
      
      clearToast()
      if (showToast) {
        import('vant').then(({ showToast }) => {
          if (showPermissionGuide) {
            // 使用简单的Toast提示
            showToast({
              message: '定位权限被拒绝，请在浏览器设置中允许定位权限',
              type: 'fail',
              duration: 5000
            })
          } else {
            showToast({
              message: errorMessage,
              type: 'fail',
              duration: 4000
            })
          }
        })
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

// 获取状态对应的颜色
const getStatusColor = (openStatus) => {
  return openStatus === 1 ? '#52c41a' : '#ff4d4f'
}

// 创建充电桩标记图标 - 参照图片设计
const createEVMarkerIcon = (color, isSelected = false, availableCount = 0) => {
  const size = isSelected ? 56 : 44
  const scale = size / 44
  const strokeWidth = isSelected ? 3 : 2
  
  // 根据可用数量确定颜色
  let markerColor = color
  if (availableCount === 0) {
    markerColor = '#999999' // 灰色表示无可用
  } else if (availableCount <= 2) {
    markerColor = '#ff9500' // 橙色表示紧张
  } else {
    markerColor = '#34c759' // 绿色表示充足
  }
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- 外圈阴影 -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" 
              fill="rgba(0,0,0,0.1)" 
              opacity="0.3"/>
      
      <!-- 主圆圈 -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - strokeWidth/2 - 1}" 
              fill="white" 
              stroke="${markerColor}" 
              stroke-width="${strokeWidth}"
              filter="url(#shadow)"/>
      
      <!-- 充电桩图标 -->
      <rect x="${size/2 - 8 * scale}" y="${size/2 - 6 * scale}" 
            width="${16 * scale}" height="${8 * scale}" 
            rx="${2 * scale}" fill="${markerColor}"/>
      
      <!-- 充电插头 -->
      <rect x="${size/2 - 2 * scale}" y="${size/2 - 8 * scale}" 
            width="${4 * scale}" height="${4 * scale}" 
            rx="${1 * scale}" fill="${markerColor}"/>
      
      <!-- 可用数量文字 -->
      <text x="${size/2}" y="${size/2 + 2 * scale}" 
            text-anchor="middle" 
            font-family="Arial, sans-serif" 
            font-size="${10 * scale}" 
            font-weight="bold" 
            fill="${markerColor}">${availableCount}</text>
    </svg>
  `
  
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// 创建用户位置标记
const createUserMarker = (position) => {
  // 清除现有用户标记
  if (userMarker) {
    map.remove(userMarker)
  }
  
  // 创建新的用户位置标记
  userMarker = new window.AMap.Marker({
    position: position,
    icon: new window.AMap.Icon({
      size: new window.AMap.Size(28.8, 28.8),
      image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg width="28.8" height="28.8" viewBox="0 0 28.8 28.8" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="userGlow">
              <feGaussianBlur stdDeviation="1.8" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="14.4" cy="14.4" r="12.6" fill="#e31c23" opacity="0.24" filter="url(#userGlow)"/>
          <circle cx="14.4" cy="14.4" r="10.8" fill="#e31c23" stroke="#fff" stroke-width="2.7"/>
          <circle cx="14.4" cy="14.4" r="5.4" fill="#fff"/>
        </svg>
      `),
      imageSize: new window.AMap.Size(28.8, 28.8)
    }),
    title: '我的位置'
  })
  
  map.add(userMarker)
}

// 监听站点数据变化
watch(() => props.stations, () => {
  if (map) {
    renderMarkers()
  }
}, { deep: true })

// 监听选中站点变化
watch(() => props.selectedStationId, () => {
  if (map) {
    renderMarkers()
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    
    // 将配置暴露到全局对象供调试使用
    window.amapConfig = amapConfig
    
    // 检查是否已经加载过高德地图SDK
    if (window.AMap) {
      initMap()
      window.initAMap()
      return
    }
    
    // 初始化地图回调函数
    initMap()
    
    // 动态加载高德地图 SDK
    const script = document.createElement('script')
    // 直接使用高德地图CDN，安全密钥通过全局配置处理
    const scriptUrl = `https://webapi.amap.com/maps?v=${amapConfig.version}&key=${amapConfig.key}&callback=initAMap`
    script.src = scriptUrl
    
    // 添加超时机制
    const timeoutId = setTimeout(() => {
      mapError.value = 'SDK加载超时，请检查网络连接'
      mapLoading.value = false
    }, 10000)
    
    script.onload = () => {
      clearTimeout(timeoutId)
    }
    
    script.onerror = (error) => {
      clearTimeout(timeoutId)
      mapError.value = 'SDK加载失败，请检查网络连接和API密钥'
      mapLoading.value = false
    }
    
    document.body.appendChild(script)
    
    // 存储router到window对象，供信息窗口调用
    window.vueRouter = router
  })
})

onUnmounted(() => {
  if (map) {
    map.destroy()
  }
  // 清理全局变量和函数
  delete window.vueRouter
  delete window.goToStationDetail
  delete window.closeInfoWindow
})

// 重新加载地图
const reloadMap = () => {
  mapLoading.value = true
  mapError.value = null
  
  // 清理现有地图
  if (map) {
    map.destroy()
    map = null
  }
  
  // 清理现有脚本
  const existingScript = document.querySelector('script[src*="amap.com"]')
  if (existingScript) {
    existingScript.remove()
  }
  
    // 重新初始化
    nextTick(() => {
      initMap()
      const script = document.createElement('script')
      // 直接使用高德地图CDN，安全密钥通过全局配置处理
      const scriptUrl = `https://webapi.amap.com/maps?v=${amapConfig.version}&key=${amapConfig.key}&callback=initAMap`
      script.src = scriptUrl
      
      script.onerror = () => {
        mapError.value = 'SDK加载失败，请检查网络连接'
        mapLoading.value = false
      }
      document.body.appendChild(script)
    })
}

// 跳转到充电桩详情页
const goToStationDetail = (stationId) => {
  router.push(`/station/${stationId}`)
}

// 关闭信息窗口
const closeInfoWindow = () => {
  if (infoWindow) {
    infoWindow.close()
  }
}

// 立即设置全局函数，确保在组件创建时就可用
window.goToStationDetail = goToStationDetail
window.closeInfoWindow = closeInfoWindow

// 调试信息

// 飞行到指定站点
const flyToStation = (station) => {
  if (!map || !station) return
  
  
  // 飞行到站点位置
  map.setZoomAndCenter(16, [station.lng, station.lat])
  
  // 高亮对应的Marker
  if (markers.length > 0) {
    markers.forEach(marker => {
      if (marker.getExtData().stationId === station.stationId) {
        // 移除其他Marker的高亮
        markers.forEach(m => {
          if (m !== marker) {
            m.setzIndex(1)
          }
        })
        // 高亮当前Marker
        marker.setzIndex(100)
      }
    })
  }
}

// 暴露方法
defineExpose({
  locateUser,
  planRouteToStation,
  openAmapNavigation,
  reloadMap,
  goToStationDetail,
  closeInfoWindow,
  flyToStation
})
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
}
#map {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

/* 自定义简约指南针 */
/* 自定义指南针样式已移除 */

/* 移除原定位按钮样式 */

.location-btn:active {
  transform: scale(0.95);
}

.clear-route-btn {
  position: absolute;
  bottom: 170px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ffffff;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.clear-route-btn:hover {
  background-color: #f5f5f5;
  transform: scale(1.05);
}

.clear-route-btn:active {
  transform: scale(0.95);
}

/* 自定义toast样式 */
:deep(.van-toast--success) {
  background-color: #b5b4b493 !important;
  color: #333 !important;
  backdrop-filter: blur(10px);
}

:deep(.van-toast--loading) {
  background-color: #b5b4b493 !important;
  color: #333 !important;
  backdrop-filter: blur(10px);
}

:deep(.van-toast--fail) {
  background-color: #b5b4b493 !important;
  color: #333 !important;
  backdrop-filter: blur(10px);
}

/* 隐藏高德地图默认的关闭按钮和箭头 */
:deep(.amap-info-window .amap-info-close) {
  display: none !important;
}

:deep(.amap-info-window .amap-info-sharp) {
  display: none !important;
}

/* 调整指南针控件大小为50% */
:deep(.amap-control-bar) {
  transform: scale(0.5) !important;
  transform-origin: top right !important;
}

/* 大众风格信息窗口 */
:deep(.volkswagen-info-window) {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 7.2px;
  padding: 14.4px;
  color: #333;
  font-family: 'Gotham', 'Helvetica Neue', Arial, sans-serif;
  min-width: 252px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.volkswagen-info-window .info-header) {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

:deep(.volkswagen-info-window .header-right) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.volkswagen-info-window .close-btn) {
  width: 20px;
  height: 20px;
  border: none;
  background: #f0f0f0;
  color: #666;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

:deep(.volkswagen-info-window .close-btn:hover) {
  background: #e0e0e0;
  color: #333;
}

:deep(.volkswagen-info-window .station-title) {
  font-size: 14.4px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

:deep(.volkswagen-info-window .status-badge) {
  padding: 3.6px 7.2px;
  border-radius: 3.6px;
  font-size: 9.9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.45px;
}

:deep(.volkswagen-info-window .station-location) {
  font-size: 10.8px;
  color: #666;
  margin: 0 0 10.8px 0;
  line-height: 1.4;
}

:deep(.volkswagen-info-window .info-grid) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7.2px;
  margin-bottom: 14.4px;
}

:deep(.volkswagen-info-window .info-item) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.volkswagen-info-window .info-item .label) {
  font-size: 9px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.45px;
}

:deep(.volkswagen-info-window .info-item .value) {
  font-size: 10.8px;
  color: #333;
  font-weight: 500;
}

:deep(.volkswagen-info-window .info-actions) {
  display: flex;
  gap: 7.2px;
}

:deep(.volkswagen-info-window .volkswagen-btn) {
  flex: 1;
  padding: 7.2px 10.8px;
  border: none;
  border-radius: 3.6px;
  font-size: 10.8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.45px;
}

:deep(.volkswagen-info-window .volkswagen-btn.primary) {
  background: #081c54;
  color: #fff;
}

:deep(.volkswagen-info-window .volkswagen-btn.primary:hover) {
  background: #081c54;
}

:deep(.volkswagen-info-window .volkswagen-btn.secondary) {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #d0d0d0;
}

:deep(.volkswagen-info-window .volkswagen-btn.secondary:hover) {
  background: #e8e8e8;
}

/* 加载状态 */
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #666;
  z-index: 1000;
}

/* 错误状态 */
.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #f56c6c;
  z-index: 1000;
  text-align: center;
  padding: 20px;
}

.map-error span {
  font-size: 14px;
}
</style>