// 公共API接口
import request from '@/utils/request'

export default {
  // 上传文件
  uploadFile: (filePath, type = 'common') => {
    return request.upload('/common/upload', filePath, { type }, {
      showLoading: true,
      loadingText: '上传中...'
    })
  },

  // 获取验证码
  getCaptcha: () => {
    return request.get('/common/captcha')
  },

  // 发送短信验证码
  sendSmsCode: (phone) => {
    return request.post('/common/sms-code', { phone }, {
      showLoading: true,
      loadingText: '发送中...'
    })
  },

  // 发送邮箱验证码
  sendEmailCode: (email) => {
    return request.post('/common/email-code', { email }, {
      showLoading: true,
      loadingText: '发送中...'
    })
  },

  // 获取省市区数据
  getRegions: (parentId = 0) => {
    return request.get('/common/regions', { parentId })
  },

  // 获取字典数据
  getDictData: (type) => {
    return request.get('/common/dict', { type })
  },

  // 获取系统配置
  getSystemSettings: () => {
    return request.get('/common/settings')
  },

  // 获取公告列表
  getAnnouncements: (params = {}) => {
    return request.get('/common/announcements', params)
  },

  // 获取公告详情
  getAnnouncementDetail: (announcementId) => {
    return request.get(`/common/announcements/${announcementId}`)
  },

  // 提交反馈
  submitFeedback: (data) => {
    return request.post('/common/feedback', data, {
      showLoading: true,
      loadingText: '提交中...'
    })
  },

  // 获取帮助文档
  getHelpDocs: (params = {}) => {
    return request.get('/common/help', params)
  },

  // 获取版本信息
  getVersionInfo: () => {
    return request.get('/common/version')
  },

  // 检查更新
  checkUpdate: () => {
    return request.get('/common/check-update')
  },

  // 获取天气信息
  getWeather: (city) => {
    return request.get('/common/weather', { city })
  },

  // 上传用户反馈图片
  uploadFeedbackImage: (filePath) => {
    return request.upload('/common/upload-feedback-image', filePath, {}, {
      showLoading: true,
      loadingText: '上传中...'
    })
  }
}
