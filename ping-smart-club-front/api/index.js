// API接口统一导出
import request from '@/utils/request'

// 导入各个模块的API
import userApi from './modules/user'
import coachApi from './modules/coach'
import adminApi from './modules/admin'
import commonApi from './modules/common'

// 将请求实例挂载到Vue原型上，方便在Vuex中使用
import Vue from 'vue'
Vue.prototype.$api = {
  ...userApi,
  ...coachApi,
  ...adminApi,
  ...commonApi
}

// 导出API对象
export default {
  ...userApi,
  ...coachApi,
  ...adminApi,
  ...commonApi
}
