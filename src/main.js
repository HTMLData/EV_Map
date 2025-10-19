import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入 Vant 组件库
import Vant from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

// 使用 Pinia
app.use(pinia)

// 使用 Vue Router
app.use(router)

// 注册 Vant 组件
app.use(Vant)

// 挂载应用
app.mount('#app')
