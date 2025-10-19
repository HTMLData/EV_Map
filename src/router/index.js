import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '充电桩查找' }
  },
  {
    path: '/station/:id',
    name: 'StationDetail',
    component: () => import('../views/StationDetail.vue'),
    meta: { title: '充电桩详情' }
  },
  {
    path: '/charge/:id',
    name: 'ChargeSession',
    component: () => import('../views/ChargeSession.vue'),
    meta: { title: '充电中' }
  },
  {
    path: '/pay/:id',
    name: 'Pay',
    component: () => import('../views/Pay.vue'),
    meta: { title: '支付' }
  },
  {
    path: '/filter',
    name: 'FilterPage',
    component: () => import('../views/FilterPage.vue'),
    meta: { title: '筛选充电桩' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '充电桩查找'
  next()
})

export default router