// 管理员相关状态管理模块
export default {
  namespaced: true,
  state: {
    // 管理员信息
    adminInfo: null,
    // 用户列表
    users: [],
    // 教练列表
    coaches: [],
    // 课程列表（管理员视角）
    allCourses: [],
    // 预约记录
    bookings: [],
    // 系统统计
    systemStats: {
      totalUsers: 0,
      totalCoaches: 0,
      totalCourses: 0,
      totalBookings: 0
    }
  },
  mutations: {
    // 设置管理员信息
    SET_ADMIN_INFO(state, adminInfo) {
      state.adminInfo = adminInfo
    },
    // 设置用户列表
    SET_USERS(state, users) {
      state.users = users || []
    },
    // 设置教练列表
    SET_COACHES(state, coaches) {
      state.coaches = coaches || []
    },
    // 设置所有课程
    SET_ALL_COURSES(state, courses) {
      state.allCourses = courses || []
    },
    // 设置预约记录
    SET_BOOKINGS(state, bookings) {
      state.bookings = bookings || []
    },
    // 设置系统统计
    SET_SYSTEM_STATS(state, stats) {
      state.systemStats = { ...state.systemStats, ...stats }
    },
    // 添加用户
    ADD_USER(state, user) {
      state.users.unshift(user)
    },
    // 更新用户
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id)
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser)
      }
    },
    // 删除用户
    REMOVE_USER(state, userId) {
      state.users = state.users.filter(user => user.id !== userId)
    },
    // 添加教练
    ADD_COACH(state, coach) {
      state.coaches.unshift(coach)
    },
    // 更新教练
    UPDATE_COACH(state, updatedCoach) {
      const index = state.coaches.findIndex(coach => coach.id === updatedCoach.id)
      if (index !== -1) {
        state.coaches.splice(index, 1, updatedCoach)
      }
    },
    // 删除教练
    REMOVE_COACH(state, coachId) {
      state.coaches = state.coaches.filter(coach => coach.id !== coachId)
    },
    // 清空管理员数据
    CLEAR_ADMIN_DATA(state) {
      state.adminInfo = null
      state.users = []
      state.coaches = []
      state.allCourses = []
      state.bookings = []
      state.systemStats = {
        totalUsers: 0,
        totalCoaches: 0,
        totalCourses: 0,
        totalBookings: 0
      }
    }
  },
  actions: {
    // 获取管理员信息
    async getAdminInfo({ commit, rootState }) {
      try {
        const userId = rootState.user.userId
        const result = await this.$api.getAdminInfo(userId)

        if (result.code === 200) {
          commit('SET_ADMIN_INFO', result.data)
          return result.data
        }
      } catch (error) {
        console.error('获取管理员信息失败:', error)
        throw error
      }
    },

    // 获取用户列表
    async getUsers({ commit }, params = {}) {
      try {
        const result = await this.$api.getUsers(params)

        if (result.code === 200) {
          commit('SET_USERS', result.data.list)
          return result.data
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        throw error
      }
    },

    // 获取教练列表
    async getCoaches({ commit }, params = {}) {
      try {
        const result = await this.$api.getCoaches(params)

        if (result.code === 200) {
          commit('SET_COACHES', result.data.list)
          return result.data
        }
      } catch (error) {
        console.error('获取教练列表失败:', error)
        throw error
      }
    },

    // 获取所有课程
    async getAllCourses({ commit }, params = {}) {
      try {
        const result = await this.$api.getAllCourses(params)

        if (result.code === 200) {
          commit('SET_ALL_COURSES', result.data.list)
          return result.data
        }
      } catch (error) {
        console.error('获取所有课程失败:', error)
        throw error
      }
    },

    // 获取预约记录
    async getBookings({ commit }, params = {}) {
      try {
        const result = await this.$api.getBookings(params)

        if (result.code === 200) {
          commit('SET_BOOKINGS', result.data.list)
          return result.data
        }
      } catch (error) {
        console.error('获取预约记录失败:', error)
        throw error
      }
    },

    // 获取系统统计
    async getSystemStats({ commit }) {
      try {
        const result = await this.$api.getSystemStats()

        if (result.code === 200) {
          commit('SET_SYSTEM_STATS', result.data)
          return result.data
        }
      } catch (error) {
        console.error('获取系统统计失败:', error)
        throw error
      }
    },

    // 创建用户
    async createUser({ commit }, userData) {
      try {
        const result = await this.$api.createUser(userData)

        if (result.code === 200) {
          commit('ADD_USER', result.data)
          return result.data
        }
      } catch (error) {
        console.error('创建用户失败:', error)
        throw error
      }
    },

    // 更新用户
    async updateUser({ commit }, { userId, userData }) {
      try {
        const result = await this.$api.updateUser(userId, userData)

        if (result.code === 200) {
          commit('UPDATE_USER', result.data)
          return result.data
        }
      } catch (error) {
        console.error('更新用户失败:', error)
        throw error
      }
    },

    // 删除用户
    async deleteUser({ commit }, userId) {
      try {
        const result = await this.$api.deleteUser(userId)

        if (result.code === 200) {
          commit('REMOVE_USER', userId)
          return true
        }
      } catch (error) {
        console.error('删除用户失败:', error)
        throw error
      }
    },

    // 创建教练
    async createCoach({ commit }, coachData) {
      try {
        const result = await this.$api.createCoach(coachData)

        if (result.code === 200) {
          commit('ADD_COACH', result.data)
          return result.data
        }
      } catch (error) {
        console.error('创建教练失败:', error)
        throw error
      }
    },

    // 更新教练
    async updateCoach({ commit }, { coachId, coachData }) {
      try {
        const result = await this.$api.updateCoach(coachId, coachData)

        if (result.code === 200) {
          commit('UPDATE_COACH', result.data)
          return result.data
        }
      } catch (error) {
        console.error('更新教练失败:', error)
        throw error
      }
    },

    // 删除教练
    async deleteCoach({ commit }, coachId) {
      try {
        const result = await this.$api.deleteCoach(coachId)

        if (result.code === 200) {
          commit('REMOVE_COACH', coachId)
          return true
        }
      } catch (error) {
        console.error('删除教练失败:', error)
        throw error
      }
    },

    // 清空管理员数据
    clearAdminData({ commit }) {
      commit('CLEAR_ADMIN_DATA')
    }
  },
  getters: {
    // 获取管理员信息
    adminInfo: state => state.adminInfo,
    // 获取用户列表
    users: state => state.users,
    // 获取教练列表
    coaches: state => state.coaches,
    // 获取所有课程
    allCourses: state => state.allCourses,
    // 获取预约记录
    bookings: state => state.bookings,
    // 获取系统统计
    systemStats: state => state.systemStats,
    // 获取活跃用户
    activeUsers: state => state.users.filter(user => user.status === 'active'),
    // 获取活跃教练
    activeCoaches: state => state.coaches.filter(coach => coach.status === 'active')
  }
}
