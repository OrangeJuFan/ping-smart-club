// 用户状态管理模块
export default {
  namespaced: true,
  state: {
    // 用户信息
    userInfo: null,
    // 用户角色：parent（家长）、coach（教练）、admin（管理员）
    userRole: null,
    // 登录状态
    isLoggedIn: false,
    // 用户Token
    token: null,
    // 用户ID
    userId: null
  },
  mutations: {
    // 设置用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      state.userId = userInfo?.id || null
      uni.setStorageSync('userInfo', userInfo)
    },
    // 设置用户角色
    SET_USER_ROLE(state, role) {
      state.userRole = role
      uni.setStorageSync('userRole', role)
    },
    // 设置登录状态
    SET_LOGIN_STATUS(state, status) {
      state.isLoggedIn = status
    },
    // 设置Token
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        uni.setStorageSync('token', token)
      } else {
        uni.removeStorageSync('token')
      }
    },
    // 清除用户状态
    CLEAR_USER_STATE(state) {
      state.userInfo = null
      state.userRole = null
      state.isLoggedIn = false
      state.token = null
      state.userId = null
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('userRole')
      uni.removeStorageSync('token')
    }
  },
  actions: {
    // 登录
    async login({ commit, dispatch }, loginData) {
      try {
        // 这里调用登录API
        const result = await this.$api.login(loginData)

        if (result.code === 200) {
          const { token, userInfo } = result.data
          commit('SET_TOKEN', token)
          commit('SET_USER_INFO', userInfo)
          commit('SET_USER_ROLE', userInfo.role)
          commit('SET_LOGIN_STATUS', true)

          // 根据角色跳转到对应页面
          dispatch('navigateAfterLogin', userInfo.role)

          return result
        } else {
          throw new Error(result.message || '登录失败')
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    // 退出登录
    logout({ commit }) {
      commit('CLEAR_USER_STATE')
      // 跳转到登录页面
      uni.reLaunch({
        url: '/pages/login/login'
      })
    },

    // 根据角色跳转页面
    navigateAfterLogin({ state }, role) {
      let url = ''
      switch (role) {
        case 'parent':
          url = '/pages/parent/parent'
          break
        case 'coach':
          url = '/pages/coach/coach'
          break
        case 'admin':
          url = '/pages/admin/admin'
          break
        default:
          url = '/pages/identity/identity'
      }
      uni.reLaunch({ url })
    },

    // 初始化用户信息（从缓存中恢复）
    initUserFromStorage({ commit }) {
      try {
        const token = uni.getStorageSync('token')
        const userInfo = uni.getStorageSync('userInfo')
        const userRole = uni.getStorageSync('userRole')

        if (token && userInfo) {
          commit('SET_TOKEN', token)
          commit('SET_USER_INFO', userInfo)
          commit('SET_USER_ROLE', userRole)
          commit('SET_LOGIN_STATUS', true)
        }
      } catch (error) {
        console.error('初始化用户信息失败:', error)
      }
    },

    // 更新用户信息
    async updateUserInfo({ commit, state }) {
      try {
        const result = await this.$api.getUserInfo(state.userId)
        if (result.code === 200) {
          commit('SET_USER_INFO', result.data)
          return result.data
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    }
  },
  getters: {
    // 获取用户信息
    getUserInfo: state => state.userInfo,
    // 获取用户角色
    getUserRole: state => state.userRole,
    // 获取登录状态
    isLoggedIn: state => state.isLoggedIn,
    // 获取用户Token
    getToken: state => state.token,
    // 获取用户ID
    getUserId: state => state.userId,
    // 判断是否是家长
    isParent: state => state.userRole === 'parent',
    // 判断是否是教练
    isCoach: state => state.userRole === 'coach',
    // 判断是否是管理员
    isAdmin: state => state.userRole === 'admin'
  }
}
