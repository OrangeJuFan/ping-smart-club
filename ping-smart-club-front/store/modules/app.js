// 应用全局状态管理模块
export default {
  namespaced: true,
  state: {
    // 全局加载状态
    loading: false,
    // 网络状态
    networkType: 'unknown',
    // 系统信息
    systemInfo: null,
    // 页面栈
    pageStack: [],
    // 全局配置
    config: {
      baseURL: 'http://localhost:8080', // 后端服务地址
      timeout: 10000, // 请求超时时间
      debug: true // 调试模式
    }
  },
  mutations: {
    // 设置加载状态
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    // 设置网络状态
    SET_NETWORK_TYPE(state, networkType) {
      state.networkType = networkType
    },
    // 设置系统信息
    SET_SYSTEM_INFO(state, systemInfo) {
      state.systemInfo = systemInfo
    },
    // 添加页面到栈
    PUSH_PAGE(state, page) {
      state.pageStack.push(page)
    },
    // 从栈中移除页面
    POP_PAGE(state) {
      state.pageStack.pop()
    },
    // 清空页面栈
    CLEAR_PAGE_STACK(state) {
      state.pageStack = []
    },
    // 更新配置
    UPDATE_CONFIG(state, config) {
      state.config = { ...state.config, ...config }
    }
  },
  actions: {
    // 显示全局加载
    showLoading({ commit }, text = '加载中...') {
      commit('SET_LOADING', true)
      uni.showLoading({
        title: text,
        mask: true
      })
    },

    // 隐藏全局加载
    hideLoading({ commit }) {
      commit('SET_LOADING', false)
      uni.hideLoading()
    },

    // 获取网络状态
    async getNetworkType({ commit }) {
      try {
        const res = await uni.getNetworkType()
        commit('SET_NETWORK_TYPE', res.networkType)
        return res.networkType
      } catch (error) {
        console.error('获取网络状态失败:', error)
        return 'unknown'
      }
    },

    // 获取系统信息
    async getSystemInfo({ commit }) {
      try {
        const res = await uni.getSystemInfo()
        commit('SET_SYSTEM_INFO', res)
        return res
      } catch (error) {
        console.error('获取系统信息失败:', error)
        return null
      }
    },

    // 显示提示消息
    showToast({ commit }, { title, icon = 'none', duration = 2000 }) {
      uni.showToast({
        title,
        icon,
        duration
      })
    },

    // 显示确认对话框
    showModal({ commit }, { title = '提示', content, showCancel = true, confirmText = '确定', cancelText = '取消' }) {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          showCancel,
          confirmText,
          cancelText,
          success: (res) => {
            resolve(res.confirm)
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    },

    // 初始化应用
    async initApp({ dispatch }) {
      // 获取系统信息
      await dispatch('getSystemInfo')
      // 获取网络状态
      await dispatch('getNetworkType')
      // 初始化用户信息
      dispatch('user/initUserFromStorage', null, { root: true })
    },

    // 页面跳转
    navigateTo({ commit }, url) {
      uni.navigateTo({
        url,
        fail: (err) => {
          console.error('页面跳转失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    },

    // 页面重定向
    redirectTo({ commit }, url) {
      uni.redirectTo({
        url,
        fail: (err) => {
          console.error('页面重定向失败:', err)
        }
      })
    },

    // 返回上一页
    navigateBack({ commit }, delta = 1) {
      uni.navigateBack({
        delta,
        fail: () => {
          // 如果无法返回，则重定向到首页
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }
      })
    },

    // 重新启动应用
    reLaunch({ commit }, url) {
      uni.reLaunch({
        url,
        fail: (err) => {
          console.error('重新启动失败:', err)
        }
      })
    }
  },
  getters: {
    // 获取加载状态
    loading: state => state.loading,
    // 获取网络状态
    networkType: state => state.networkType,
    // 获取系统信息
    systemInfo: state => state.systemInfo,
    // 获取当前页面
    currentPage: state => state.pageStack[state.pageStack.length - 1],
    // 获取页面栈长度
    pageStackLength: state => state.pageStack.length,
    // 获取应用配置
    appConfig: state => state.config,
    // 判断是否为开发环境
    isDev: state => state.config.debug,
    // 判断网络是否可用
    isNetworkAvailable: state => state.networkType !== 'none' && state.networkType !== 'unknown'
  }
}
