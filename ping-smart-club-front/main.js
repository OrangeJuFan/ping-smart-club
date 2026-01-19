import App from './App'

// 导入Vuex状态管理
import store from './store'

// 导入API接口
import api from './api'

// 导入工具函数
import * as utils from './utils'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

Vue.config.productionTip = false
App.mpType = 'app'

// 将API和工具函数挂载到Vue原型上
Vue.prototype.$api = api
Vue.prototype.$utils = utils

const app = new Vue({
  store,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // Vue 3 中使用 provide/inject 或 app.config.globalProperties
  app.config.globalProperties.$api = api
  app.config.globalProperties.$utils = utils
  app.use(store)
  return {
    app
  }
}
// #endif