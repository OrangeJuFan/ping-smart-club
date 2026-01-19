// HTTP请求封装模块
import store from '@/store'

// 请求配置
const config = {
  baseURL: 'http://localhost:8080', // 后端服务地址
  timeout: 10000, // 请求超时时间
  retryTimes: 3, // 重试次数
  retryDelay: 1000 // 重试间隔
}

// 请求拦截器
const requestInterceptor = (options) => {
  // 添加基础配置
  options.url = config.baseURL + options.url
  options.timeout = options.timeout || config.timeout
  options.header = options.header || {}

  // 添加认证头
  const token = store.state.user.token || uni.getStorageSync('token')
  if (token) {
    options.header['Authorization'] = `Bearer ${token}`
  }

  // 添加平台标识
  options.header['X-Platform'] = process.env.UNI_PLATFORM || 'h5'

  // 添加时间戳防止缓存
  if (options.method && options.method.toUpperCase() === 'GET') {
    const timestamp = new Date().getTime()
    options.url += (options.url.includes('?') ? '&' : '?') + `_t=${timestamp}`
  }

  return options
}

// 响应拦截器
const responseInterceptor = (response, resolve, reject) => {
  const { statusCode, data } = response

  // 处理HTTP状态码
  if (statusCode === 200) {
    // 处理业务状态码
    if (data.code === 200) {
      resolve(data)
    } else if (data.code === 401) {
      // Token过期，清除登录状态并跳转到登录页
      store.dispatch('user/logout')
      reject(new Error('登录已过期，请重新登录'))
    } else if (data.code === 403) {
      reject(new Error('没有权限访问'))
    } else if (data.code === 500) {
      reject(new Error('服务器内部错误'))
    } else {
      reject(new Error(data.message || '请求失败'))
    }
  } else if (statusCode === 401) {
    // 未授权
    store.dispatch('user/logout')
    reject(new Error('登录已过期，请重新登录'))
  } else if (statusCode === 403) {
    reject(new Error('没有权限访问'))
  } else if (statusCode === 404) {
    reject(new Error('请求地址不存在'))
  } else if (statusCode === 500) {
    reject(new Error('服务器内部错误'))
  } else if (statusCode >= 400 && statusCode < 500) {
    reject(new Error('客户端请求错误'))
  } else if (statusCode >= 500) {
    reject(new Error('服务器错误'))
  } else {
    reject(new Error(`网络错误: ${statusCode}`))
  }
}

// 错误处理
const handleError = (error, options, resolve, reject) => {
  console.error('请求失败:', error)

  // 检查是否需要重试
  if (options.retryCount < config.retryTimes) {
    options.retryCount++
    console.log(`第${options.retryCount}次重试请求: ${options.url}`)

    // 延迟重试
    setTimeout(() => {
      request(options).then(resolve).catch(reject)
    }, config.retryDelay * options.retryCount)
  } else {
    // 重试失败，返回错误
    reject(error)
  }
}

// 核心请求函数
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 设置重试次数
    options.retryCount = options.retryCount || 0

    // 请求拦截
    options = requestInterceptor(options)

    // 显示加载提示（如果需要）
    if (options.showLoading) {
      uni.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      })
    }

    // 发送请求
    uni.request({
      ...options,
      success: (response) => {
        // 隐藏加载提示
        if (options.showLoading) {
          uni.hideLoading()
        }

        // 响应拦截
        responseInterceptor(response, resolve, reject)
      },
      fail: (error) => {
        // 隐藏加载提示
        if (options.showLoading) {
          uni.hideLoading()
        }

        // 处理错误
        handleError(error, options, resolve, reject)
      }
    })
  })
}

// HTTP方法封装
const http = {
  get: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'GET',
      data,
      ...options
    })
  },

  post: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'POST',
      data,
      ...options
    })
  },

  put: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  },

  delete: (url, data = {}, options = {}) => {
    return request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  },

  upload: (url, filePath, formData = {}, options = {}) => {
    return new Promise((resolve, reject) => {
      // 显示加载提示
      if (options.showLoading) {
        uni.showLoading({
          title: options.loadingText || '上传中...',
          mask: true
        })
      }

      uni.uploadFile({
        url: config.baseURL + url,
        filePath,
        name: options.name || 'file',
        formData,
        header: {
          'Authorization': `Bearer ${store.state.user.token || uni.getStorageSync('token')}`,
          ...options.header
        },
        success: (response) => {
          // 隐藏加载提示
          if (options.showLoading) {
            uni.hideLoading()
          }

          try {
            const data = JSON.parse(response.data)
            if (data.code === 200) {
              resolve(data)
            } else {
              reject(new Error(data.message || '上传失败'))
            }
          } catch (error) {
            reject(new Error('上传响应解析失败'))
          }
        },
        fail: (error) => {
          // 隐藏加载提示
          if (options.showLoading) {
            uni.hideLoading()
          }

          console.error('上传失败:', error)
          reject(error)
        }
      })
    })
  }
}

export default http
