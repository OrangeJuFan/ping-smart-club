// 用户相关API接口
import request from '@/utils/request'

export default {
  // 用户登录
  login: (data) => {
    return request.post('/auth/login', data, {
      showLoading: true,
      loadingText: '登录中...'
    })
  },

  // 用户注册
  register: (data) => {
    return request.post('/auth/register', data, {
      showLoading: true,
      loadingText: '注册中...'
    })
  },

  // 获取用户信息
  getUserInfo: (userId) => {
    return request.get(`/user/info/${userId}`)
  },

  // 更新用户信息
  updateUserInfo: (userId, data) => {
    return request.put(`/user/info/${userId}`, data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 修改密码
  changePassword: (data) => {
    return request.post('/user/change-password', data, {
      showLoading: true,
      loadingText: '修改中...'
    })
  },

  // 上传头像
  uploadAvatar: (filePath) => {
    return request.upload('/user/upload-avatar', filePath, {}, {
      showLoading: true,
      loadingText: '上传中...'
    })
  },

  // 获取用户列表（管理员用）
  getUsers: (params = {}) => {
    return request.get('/admin/users', params)
  },

  // 创建用户（管理员用）
  createUser: (data) => {
    return request.post('/admin/users', data, {
      showLoading: true,
      loadingText: '创建中...'
    })
  },

  // 更新用户（管理员用）
  updateUser: (userId, data) => {
    return request.put(`/admin/users/${userId}`, data, {
      showLoading: true,
      loadingText: '更新中...'
    })
  },

  // 删除用户（管理员用）
  deleteUser: (userId) => {
    return request.delete(`/admin/users/${userId}`, {}, {
      showLoading: true,
      loadingText: '删除中...'
    })
  },

  // 重置用户密码（管理员用）
  resetPassword: (userId, data) => {
    return request.post(`/admin/users/${userId}/reset-password`, data, {
      showLoading: true,
      loadingText: '重置中...'
    })
  }
}
