import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'

// 全局样式
import './assets/main.css'

// 通用字体
import 'vfonts/Lato.css'
// 等宽字体
import 'vfonts/FiraCode.css'

// 图标库
import '@fortawesome/fontawesome-free/css/all.css';

import naive from 'naive-ui'

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
