// 教练相关API接口
import request from '@/utils/request'

export default {
  // 获取教练信息
  getCoachInfo: (coachId) => {
    return request.get(`/coach/info/${coachId}`)
  },

  // 更新教练信息
  updateCoachInfo: (coachId, data) => {
    return request.put(`/coach/info/${coachId}`, data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 获取教练列表
  getCoaches: (params = {}) => {
    return request.get('/coach/list', params)
  },

  // 创建教练（管理员用）
  createCoach: (data) => {
    return request.post('/admin/coaches', data, {
      showLoading: true,
      loadingText: '创建中...'
    })
  },

  // 更新教练（管理员用）
  updateCoach: (coachId, data) => {
    return request.put(`/admin/coaches/${coachId}`, data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 删除教练（管理员用）
  deleteCoach: (coachId) => {
    return request.delete(`/admin/coaches/${coachId}`, {}, {
      showLoading: true,
      loadingText: '删除中...'
    })
  },

  // 获取教练课程列表
  getCoachCourses: (params = {}) => {
    return request.get('/coach/courses', params)
  },

  // 创建课程
  createCourse: (data) => {
    return request.post('/coach/courses', data, {
      showLoading: true,
      loadingText: '创建中...'
    })
  },

  // 更新课程
  updateCourse: (courseId, data) => {
    return request.put(`/coach/courses/${courseId}`, data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 删除课程
  deleteCourse: (courseId) => {
    return request.delete(`/coach/courses/${courseId}`, {}, {
      showLoading: true,
      loadingText: '删除中...'
    })
  },

  // 获取今日课程
  getTodayCourses: (coachId) => {
    return request.get(`/coach/courses/today/${coachId}`)
  },

  // 获取课程统计
  getCourseStats: (coachId) => {
    return request.get(`/coach/courses/stats/${coachId}`)
  },

  // 获取教练学员列表
  getCoachStudents: (coachId) => {
    return request.get(`/coach/students/${coachId}`)
  },

  // 获取课程详情
  getCourseDetail: (courseId) => {
    return request.get(`/coach/courses/${courseId}`)
  },

  // 课程签到
  courseCheckIn: (courseId, studentId) => {
    return request.post(`/coach/courses/${courseId}/checkin/${studentId}`)
  },

  // 课程签退
  courseCheckOut: (courseId, studentId) => {
    return request.post(`/coach/courses/${courseId}/checkout/${studentId}`)
  },

  // 获取课程预约列表
  getCourseBookings: (courseId, params = {}) => {
    return request.get(`/coach/courses/${courseId}/bookings`, params)
  },

  // 确认预约
  confirmBooking: (bookingId) => {
    return request.post(`/coach/bookings/${bookingId}/confirm`)
  },

  // 拒绝预约
  rejectBooking: (bookingId, data = {}) => {
    return request.post(`/coach/bookings/${bookingId}/reject`, data)
  }
}
