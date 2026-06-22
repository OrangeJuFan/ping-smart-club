<template>
  <view class="page">
    <view class="title-row">
      <text class="page-title">个人资料</text>
    </view>

    <uni-card v-if="session.guardian" title="家长账号" :is-shadow="true">
      <text class="profile-name">{{ session.guardian.name }}</text>
      <text class="profile-meta">{{ session.guardian.relation }} · {{ session.guardian.phone }}</text>
    </uni-card>

    <uni-card v-if="currentStudent" title="当前学员" :is-shadow="true">
      <view class="student-card">
      <view class="avatar" :style="{ backgroundColor: currentStudent.avatarColor }">
        <text>{{ currentStudent.name.slice(0, 1) }}</text>
      </view>
      <view class="student-info">
        <text class="profile-name">{{ currentStudent.name }}</text>
        <text class="profile-meta">{{ currentStudent.level }} · {{ currentStudent.age }} 岁 · 剩余 {{ currentStudent.balance }} 课时</text>
        <text class="student-remark">{{ currentStudent.remark }}</text>
      </view>
      </view>
    </uni-card>

    <uni-card title="绑定的孩子" :is-shadow="true">
      <uni-list>
        <uni-list-item
          v-for="student in session.students"
          :key="student.id"
          clickable
          :title="student.name"
          :note="student.level + ' · 剩余 ' + student.balance + ' 课时'"
          :right-text="student.id === session.selectedStudentId ? '当前' : '切换'"
          @click="switchStudent(student.id)"
        />
      </uni-list>
    </uni-card>

    <uni-card title="绑定学员" :is-shadow="true">
      <view class="form-card">
      <view>
        <text class="form-tip">可继续绑定多个孩子，首页会显示切换入口。</text>
      </view>
      <view class="field">
        <text>学员姓名</text>
        <input v-model="bindForm.name" maxlength="12" placeholder="请输入学员姓名" />
      </view>
      <view class="field">
        <text>学员手机号</text>
        <input v-model="bindForm.phone" maxlength="11" type="number" placeholder="请输入学员手机号" />
      </view>
      <button class="primary-btn" :loading="loading" @click="bindStudent">绑定</button>
      </view>
    </uni-card>

    <uni-list class="menu-list">
      <uni-list-item title="我的预约" show-arrow clickable @click="navigate('/pages/parent/appointments')" />
      <uni-list-item title="课时与成长记录" show-arrow clickable @click="navigate('/pages/parent/records')" />
      <uni-list-item title="消息通知" show-arrow clickable @click="navigate('/pages/parent/messages')" />
    </uni-list>

    <view class="button-row">
      <button class="secondary-btn" @click="resetDemo">恢复演示数据</button>
      <button class="danger-btn" @click="logout">退出登录</button>
    </view>

    <custom-tabbar :user-role="'parent'" :current="2" />
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import CustomTabbar from '@/pages/components/custom-tabbar.vue'

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      loading: false,
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
    currentStudent() {
      return this.session.students.find(item => item.id === this.session.selectedStudentId) || null
    }
  },
  onShow() {
    this.loadSession()
  },
  methods: {
    async loadSession() {
      try {
        this.session = await parentMock.getSession()
        if (!this.session.guardian) uni.reLaunch({ url: '/pages/login/login' })
      } catch (error) {
        this.toast(error.message || '加载失败')
      }
    },
    async switchStudent(studentId) {
      try {
        this.session = await parentMock.switchStudent(studentId)
      } catch (error) {
        this.toast(error.message || '切换失败')
      }
    },
    async bindStudent() {
      this.loading = true
      try {
        this.session = await parentMock.bindStudent(this.bindForm)
        this.bindForm = { name: '', phone: '' }
        this.toast('绑定成功', 'success')
      } catch (error) {
        this.toast(error.message || '绑定失败')
      } finally {
        this.loading = false
      }
    },
    resetDemo() {
      uni.showModal({
        title: '恢复演示数据',
        content: '会重置家长端本地演示数据，确认继续吗？',
        success: async res => {
          if (!res.confirm) return
          await parentMock.resetDemoData()
          this.toast('已恢复', 'success')
          uni.reLaunch({ url: '/pages/login/login' })
        }
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确认退出当前账号吗？',
        success: async res => {
          if (!res.confirm) return
          await parentMock.logout()
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.removeStorageSync('userRole')
          uni.reLaunch({ url: '/pages/login/login' })
        }
      })
    },
    navigate(url) {
      uni.navigateTo({ url })
    },
    toast(title, icon) {
      uni.showToast({ title, icon: icon || 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 140rpx;
  background: #f7f8f4;
}

.title-row {
  margin-bottom: 22rpx;
}

.page-title {
  color: #17201d;
  font-size: 44rpx;
  font-weight: 900;
}

.form-card,
.student-info {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.eyebrow,
.profile-meta,
.student-remark,
.form-tip,
.field text {
  color: #66736d;
  font-size: 26rpx;
}

.profile-name,
.section-title {
  color: #17201d;
  font-size: 34rpx;
  font-weight: 900;
}

.student-card,
.button-row {
  display: flex;
  align-items: center;
}

.student-card {
  gap: 20rpx;
}

.avatar,
.mini-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-radius: 50%;
  font-weight: 900;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
}

.student-info {
  flex: 1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.field input {
  height: 82rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dce4de;
  border-radius: 14rpx;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  height: 82rpx;
  margin: 0;
  border-radius: 14rpx;
  font-size: 28rpx;
  line-height: 82rpx;
}

.primary-btn {
  color: #ffffff;
  background: #0f766e;
}

.button-row {
  gap: 18rpx;
}

.button-row button {
  flex: 1;
}

.secondary-btn {
  color: #0f766e;
  background: #edf4f1;
}

.danger-btn {
  color: #c2413b;
  background: #fff2f0;
}
</style>
