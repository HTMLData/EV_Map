<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :fill="color" xmlns="http://www.w3.org/2000/svg">
    <!-- 定位图标 -->
    <g v-if="name === 'location'">
      <circle cx="12" cy="12" r="3" :fill="color"/>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" :fill="color"/>
    </g>
    
    <!-- 清除路线图标 -->
    <g v-else-if="name === 'clear-route'">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" :fill="color"/>
    </g>
    
    <!-- 充电桩图标 -->
    <g v-else-if="name === 'charging-station'">
      <rect x="6" y="4" width="12" height="16" rx="1" :fill="color"/>
      <rect x="8" y="2" width="8" height="3" rx="0.5" :fill="color"/>
      <rect x="10" y="6" width="4" height="2" rx="0.5" :fill="color"/>
      <circle cx="12" cy="10" r="1" :fill="color"/>
      <circle cx="12" cy="13" r="1" :fill="color"/>
      <circle cx="12" cy="16" r="1" :fill="color"/>
      <path d="M10 18h4v2h-4z" :fill="color"/>
    </g>
    
    <!-- 导航图标 -->
    <g v-else-if="name === 'navigation'">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" :fill="color"/>
    </g>
    
    <!-- 搜索图标 -->
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="8" :fill="color"/>
      <path d="m21 21-4.35-4.35" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </g>
    
    <!-- 筛选图标 -->
    <g v-else-if="name === 'filter'">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" :fill="color"/>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 24
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})
</script>
