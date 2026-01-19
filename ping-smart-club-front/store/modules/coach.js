// 教练相关状态管理模块
export default {
  namespaced: true,
  state: {
    // 教练信息
    coachInfo: null,
    // 课程列表
    courses: [],
    // 学员列表
    students: [],
    // 今日课程
    todayCourses: [],
    // 课程统计
    courseStats: {
      totalCourses: 0,
      completedCourses: 0,
      upcomingCourses: 0
    }
  },
  mutations: {
    // 设置教练信息
    SET_COACH_INFO(state, coachInfo) {
      state.coachInfo = coachInfo
    },
    // 设置课程列表
    SET_COURSES(state, courses) {
      state.courses = courses || []
    },
    // 设置学员列表
    SET_STUDENTS(state, students) {
      state.students = students || []
    },
    // 设置今日课程
    SET_TODAY_COURSES(state, courses) {
      state.todayCourses = courses || []
    },
    // 设置课程统计
    SET_COURSE_STATS(state, stats) {
      state.courseStats = { ...state.courseStats, ...stats }
    },
    // 添加课程
    ADD_COURSE(state, course) {
      state.courses.unshift(course)
    },
    // 更新课程
    UPDATE_COURSE(state, updatedCourse) {
      const index = state.courses.findIndex(course => course.id === updatedCourse.id)
      if (index !== -1) {
        state.courses.splice(index, 1, updatedCourse)
      }
    },
    // 删除课程
    REMOVE_COURSE(state, courseId) {
      state.courses = state.courses.filter(course => course.id !== courseId)
    },
    // 清空教练数据
    CLEAR_COACH_DATA(state) {
      state.coachInfo = null
      state.courses = []
      state.students = []
      state.todayCourses = []
      state.courseStats = {
        totalCourses: 0,
        completedCourses: 0,
        upcomingCourses: 0
      }
    }
  },
  actions: {
    // 获取教练信息
    async getCoachInfo({ commit, rootState }) {
      try {
        const userId = rootState.user.userId
        const result = await this.$api.getCoachInfo(userId)

        if (result.code === 200) {
          commit('SET_COACH_INFO', result.data)
          return result.data
        }
      } catch (error) {
        console.error('获取教练信息失败:', error)
        throw error
      }
    },

    // 获取课程列表
    async getCourses({ commit, rootState }, params = {}) {
      try {
        const result = await this.$api.getCoachCourses({
          coachId: rootState.user.userId,
          ...params
        })

        if (result.code === 200) {
          commit('SET_COURSES', result.data.list)
          return result.data
        }
      } catch (error) {
        console.error('获取课程列表失败:', error)
        throw error
      }
    },

    // 获取今日课程
    async getTodayCourses({ commit, rootState }) {
      try {
        const result = await this.$api.getTodayCourses(rootState.user.userId)

        if (result.code === 200) {
          commit('SET_TODAY_COURSES', result.data)
          return result.data
        }
      } catch (error) {
        console.error('获取今日课程失败:', error)
        throw error
      }
    },

    // 获取学员列表
    async getStudents({ commit, rootState }) {
      try {
        const result = await this.$api.getCoachStudents(rootState.user.userId)

        if (result.code === 200) {
          commit('SET_STUDENTS', result.data)
          return result.data
        }
      } catch (error) {
        console.error('获取学员列表失败:', error)
        throw error
      }
    },

    // 创建课程
    async createCourse({ commit, dispatch }, courseData) {
      try {
        const result = await this.$api.createCourse(courseData)

        if (result.code === 200) {
          commit('ADD_COURSE', result.data)
          // 重新获取统计数据
          dispatch('getCourseStats')
          return result.data
        }
      } catch (error) {
        console.error('创建课程失败:', error)
        throw error
      }
    },

    // 更新课程
    async updateCourse({ commit }, { courseId, courseData }) {
      try {
        const result = await this.$api.updateCourse(courseId, courseData)

        if (result.code === 200) {
          commit('UPDATE_COURSE', result.data)
          return result.data
        }
      } catch (error) {
        console.error('更新课程失败:', error)
        throw error
      }
    },

    // 删除课程
    async deleteCourse({ commit }, courseId) {
      try {
        const result = await this.$api.deleteCourse(courseId)

        if (result.code === 200) {
          commit('REMOVE_COURSE', courseId)
          return true
        }
      } catch (error) {
        console.error('删除课程失败:', error)
        throw error
      }
    },

    // 获取课程统计
    async getCourseStats({ commit, rootState }) {
      try {
        const result = await this.$api.getCourseStats(rootState.user.userId)

        if (result.code === 200) {
          commit('SET_COURSE_STATS', result.data)
          return result.data
        }
      } catch (error) {
        console.error('获取课程统计失败:', error)
        throw error
      }
    },

    // 清空教练数据
    clearCoachData({ commit }) {
      commit('CLEAR_COACH_DATA')
    }
  },
  getters: {
    // 获取教练信息
    coachInfo: state => state.coachInfo,
    // 获取课程列表
    courses: state => state.courses,
    // 获取学员列表
    students: state => state.students,
    // 获取今日课程
    todayCourses: state => state.todayCourses,
    // 获取课程统计
    courseStats: state => state.courseStats,
    // 获取进行中的课程
    ongoingCourses: state => state.courses.filter(course => course.status === 'ongoing'),
    // 获取已完成的课程
    completedCourses: state => state.courses.filter(course => course.status === 'completed'),
    // 获取即将开始的课程
    upcomingCourses: state => state.courses.filter(course => course.status === 'upcoming')
  }
}
