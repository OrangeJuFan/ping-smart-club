import Vue from 'vue'
import Vuex from 'vuex'

// 导入各个模块
import user from './modules/user'
import app from './modules/app'
import coach from './modules/coach'
import admin from './modules/admin'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    app,
    coach,
    admin
  },
  // 全局状态
  state: {
    version: '1.0.0'
  },
  mutations: {
    SET_VERSION(state, version) {
      state.version = version
    }
  },
  actions: {
    setVersion({ commit }, version) {
      commit('SET_VERSION', version)
    }
  },
  getters: {
    appVersion: state => state.version
  }
})
