<template>
  <view class="login-page">
    <view class="hero">
      <text class="brand">Ping Smart Club</text>
      <text class="title">{{ session.guardian ? '绑定学员' : '登录' }}</text>
      <text class="subtitle">预约课程、查看课时、签到和接收课程提醒。</text>
    </view>

    <uni-card v-if="!session.guardian" :is-shadow="true">
      <uni-segmented-control
        :current="loginModeIndex"
        :values="['手机号', '微信授权']"
        style-type="button"
        active-color="#0f766e"
        @clickItem="changeLoginMode"
      />

      <view v-if="loginMode === 'phone'" class="form">
        <view class="field">
          <text>家长手机号</text>
          <input v-model="phone" maxlength="11" type="number" placeholder="请输入手机号" />
        </view>
        <button class="primary-btn" :loading="loading" @click="handlePhoneLogin">登录</button>
      </view>

      <view v-else class="form">
        <button class="primary-btn" :loading="loading" open-type="getUserInfo" @getuserinfo="handleWechatLogin">
          微信授权登录
        </button>
      </view>
    </uni-card>

    <uni-card v-else :is-shadow="true">
      <view class="section-head">
        <text class="section-title">绑定学员信息</text>
        <text class="section-subtitle">可绑定多个孩子，后续可在首页切换。</text>
      </view>
      <view class="form">
        <view class="field">
          <text>学员姓名</text>
          <input v-model="bindForm.name" maxlength="12" placeholder="请输入学员姓名" />
        </view>
        <view class="field">
          <text>学员手机号</text>
          <input v-model="bindForm.phone" maxlength="11" type="number" placeholder="请输入学员手机号" />
        </view>
        <button class="primary-btn" :loading="loading" @click="handleBind">绑定并进入</button>
      </view>

      <view v-if="session.students.length" class="child-list">
        <text class="child-title">已绑定学员</text>
        <uni-list>
          <uni-list-item
            v-for="student in session.students"
            :key="student.id"
            :title="student.name"
            :note="student.level + ' · 剩余 ' + student.balance + ' 课时'"
          />
        </uni-list>
        <button class="secondary-btn" @click="goHome">进入首页</button>
      </view>
    </uni-card>
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'

export default {
  data() {
    return {
      loading: false,
      loginModeIndex: 0,
      phone: '13900010001',
      session: {
        guardian: null,
        students: [],
        selectedStudentId: ''
      },
      bindForm: {
        name: '',
        phone: ''
      }
    }
  },
  computed: {
    loginMode() {
      return this.loginModeIndex === 0 ? 'phone' : 'wechat'
    }
  },
  onLoad() {
    this.loadSession()
  },
  methods: {
    async loadSession() {
      try {
        this.session = await parentMock.getSession()
      } catch (error) {
        this.toast(error.message || '加载失败')
      }
    },
    changeLoginMode(event) {
      this.loginModeIndex = event.currentIndex
    },
    async handlePhoneLogin() {
      this.loading = true
      try {
        this.session = await parentMock.loginByPhone(this.phone)
        this.saveLoginInfo(this.session.guardian)
        if (this.session.students.length) {
          this.goHome()
        } else {
          this.toast('登录成功，请绑定学员', 'success')
        }
      } catch (error) {
        this.toast(error.message || '登录失败')
      } finally {
        this.loading = false
      }
    },
    async handleWechatLogin(event) {
      this.loading = true
      try {
        const userInfo = event.detail && event.detail.userInfo ? event.detail.userInfo : { nickName: '微信家长' }
        this.session = await parentMock.loginByWechat(userInfo)
        this.saveLoginInfo(this.session.guardian)
        if (this.session.students.length) {
          this.goHome()
        } else {
          this.toast('登录成功，请绑定学员', 'success')
        }
      } catch (error) {
        this.toast(error.message || '微信登录失败')
      } finally {
        this.loading = false
      }
    },
    async handleBind() {
      this.loading = true
      try {
        this.session = await parentMock.bindStudent(this.bindForm)
        this.bindForm = { name: '', phone: '' }
        this.toast('绑定成功', 'success')
        this.goHome()
      } catch (error) {
        this.toast(error.message || '绑定失败')
      } finally {
        this.loading = false
      }
    },
    saveLoginInfo(guardian) {
      uni.setStorageSync('token', 'parent_mock_token')
      uni.setStorageSync('userRole', 'parent')
      uni.setStorageSync('userInfo', {
        nickName: guardian ? guardian.name : '学员家长',
        avatarUrl: '/static/images/default-avatar.png'
      })
    },
    goHome() {
      uni.reLaunch({ url: '/pages/parent/parent' })
    },
    toast(title, icon) {
      uni.showToast({ title, icon: icon || 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 72rpx 32rpx 40rpx;
  background: #f7f8f4;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 34rpx;
}

.brand {
  color: #66736d;
  font-size: 24rpx;
}

.title {
  color: #17201d;
  font-size: 64rpx;
  font-weight: 900;
  line-height: 1.1;
}

.subtitle,
.section-subtitle,
.child-meta {
  color: #66736d;
  font-size: 26rpx;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-top: 28rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.field text {
  color: #66736d;
  font-size: 26rpx;
}

.field input {
  height: 86rpx;
  padding: 0 22rpx;
  color: #17201d;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 14rpx;
}

.primary-btn,
.secondary-btn {
  height: 86rpx;
  margin: 0;
  border-radius: 14rpx;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 86rpx;
}

.primary-btn {
  color: #ffffff;
  background: #0f766e;
}

.secondary-btn {
  color: #0f766e;
  background: #edf4f1;
}

.section-head,
.child-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.section-title,
.child-title {
  color: #17201d;
  font-size: 34rpx;
  font-weight: 800;
}

</style>
