// 管理员相关API接口
import request from '@/utils/request'

export default {
  // 获取管理员信息
  getAdminInfo: (adminId) => {
    return request.get(`/admin/info/${adminId}`)
  },

  // 更新管理员信息
  updateAdminInfo: (adminId, data) => {
    return request.put(`/admin/info/${adminId}`, data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 获取所有课程
  getAllCourses: (params = {}) => {
    return request.get('/admin/courses', params)
  },

  // 获取预约记录
  getBookings: (params = {}) => {
    return request.get('/admin/bookings', params)
  },

  // 获取系统统计
  getSystemStats: () => {
    return request.get('/admin/stats')
  },

  // 导出数据
  exportData: (type, params = {}) => {
    return request.get(`/admin/export/${type}`, params, {
      showLoading: true,
      loadingText: '导出中...'
    })
  },

  // 获取系统日志
  getSystemLogs: (params = {}) => {
    return request.get('/admin/logs', params)
  },

  // 更新系统配置
  updateSystemConfig: (data) => {
    return request.put('/admin/config', data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 获取系统配置
  getSystemConfig: () => {
    return request.get('/admin/config')
  },

  // 发送系统通知
  sendNotification: (data) => {
    return request.post('/admin/notifications', data, {
      showLoading: true,
      loadingText: '发送中...'
    })
  },

  // 获取反馈列表
  getFeedbacks: (params = {}) => {
    return request.get('/admin/feedbacks', params)
  },

  // 处理反馈
  processFeedback: (feedbackId, data) => {
    return request.post(`/admin/feedbacks/${feedbackId}/process`, data)
  },

  // 获取数据报表
  getReports: (type, params = {}) => {
    return request.get(`/admin/reports/${type}`, params)
  },

  // 备份数据
  backupData: () => {
    return request.post('/admin/backup', {}, {
      showLoading: true,
      loadingText: '备份中...'
    })
  },

  // 恢复数据
  restoreData: (backupId) => {
    return request.post(`/admin/restore/${backupId}`, {}, {
      showLoading: true,
      loadingText: '恢复中...'
    })
  },

  // 获取备份列表
  getBackups: () => {
    return request.get('/admin/backups')
  }
}
