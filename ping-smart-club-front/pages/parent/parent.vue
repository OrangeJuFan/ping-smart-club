<template>
  <view class="page">
    <view class="topbar">
      <view>
        <text class="eyebrow">Ping Smart Club</text>
        <student-switcher
          :students="session.students"
          :selected-student-id="session.selectedStudentId"
          @change="switchStudent"
        />
      </view>
      <view class="message-dot" @click="navigate('/pages/parent/messages')">
        <text>{{ summary ? summary.unreadMessageCount : 0 }}</text>
      </view>
    </view>

    <view v-if="summary" class="balance-card">
      <view>
        <text class="balance-label">课时余额</text>
        <view class="balance-line">
          <text class="balance-num">{{ summary.student.balance }}</text>
          <text class="balance-unit">课时</text>
        </view>
      </view>
      <text class="balance-status">{{ summary.creditWarning ? '余额偏低' : summary.student.level }}</text>
    </view>

    <view class="quick-grid">
      <view class="quick-item" @click="navigate('/pages/parent/booking')">
        <text class="quick-icon">+</text>
        <text>预约课程</text>
      </view>
      <view class="quick-item" @click="navigate('/pages/parent/appointments')">
        <text class="quick-icon">#</text>
        <text>我的预约</text>
      </view>
      <view class="quick-item" @click="navigate('/pages/parent/records')">
        <text class="quick-icon">¥</text>
        <text>课时记录</text>
      </view>
      <view class="quick-item" @click="navigate('/pages/parent/my')">
        <text class="quick-icon">i</text>
        <text>个人资料</text>
      </view>
    </view>

    <view class="section">
      <view class="section-head">
        <text>今日/近期课程</text>
        <text class="link" @click="navigate('/pages/parent/appointments')">全部</text>
      </view>
      <view v-if="summary && summary.upcomingBookings.length" class="list">
        <booking-card
          v-for="item in summary.upcomingBookings"
          :key="item.booking.id"
          :item="item"
          @cancel="cancelBooking"
          @checkin="checkIn"
        />
      </view>
      <view v-else class="empty-box">
        <text>暂无近期课程</text>
        <button @click="navigate('/pages/parent/booking')">去预约</button>
      </view>
    </view>

    <view class="section">
      <view class="section-head">
        <text>成长记录</text>
        <text class="link" @click="navigate('/pages/parent/records')">查看</text>
      </view>
      <view v-if="summary && summary.recentBookings.length" class="history-strip">
        <text>最近完成 {{ summary.recentBookings.length }} 节课程，成长备注已同步。</text>
      </view>
      <view v-else class="history-strip">
        <text>完成课程后会在这里同步成长记录。</text>
      </view>
    </view>

    <custom-tabbar :user-role="'parent'" :current="0" />
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import CustomTabbar from '@/pages/components/custom-tabbar.vue'
import StudentSwitcher from '@/components/parent/student-switcher.vue'
import BookingCard from '@/components/parent/booking-card.vue'

export default {
  components: {
    CustomTabbar,
    StudentSwitcher,
    BookingCard
  },
  data() {
    return {
      loading: false,
      session: {
        guardian: null,
        students: [],
        selectedStudentId: ''
      },
      summary: null
    }
  },
  onShow() {
    this.loadPage()
  },
  methods: {
    async loadPage() {
      try {
        this.session = await parentMock.getSession()
        if (!this.session.guardian) {
          uni.reLaunch({ url: '/pages/login/login' })
          return
        }
        if (!this.session.students.length) {
          uni.reLaunch({ url: '/pages/login/login' })
          return
        }
        this.summary = await parentMock.getHomeSummary()
      } catch (error) {
        this.toast(error.message || '加载失败')
      }
    },
    async switchStudent(studentId) {
      try {
        this.session = await parentMock.switchStudent(studentId)
        this.summary = await parentMock.getHomeSummary()
      } catch (error) {
        this.toast(error.message || '切换失败')
      }
    },
    async cancelBooking(bookingId) {
      uni.showModal({
        title: '取消预约',
        content: '确认取消这节课程预约吗？',
        success: async res => {
          if (!res.confirm) return
          try {
            await parentMock.cancelBooking(bookingId)
            this.toast('预约已取消', 'success')
            this.loadPage()
          } catch (error) {
            this.toast(error.message || '取消失败')
          }
        }
      })
    },
    async checkIn(bookingId) {
      try {
        await parentMock.checkIn(bookingId)
        this.toast('签到成功', 'success')
        this.loadPage()
      } catch (error) {
        this.toast(error.message || '签到失败')
      }
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

.topbar,
.balance-card,
.section-head,
.quick-grid {
  display: flex;
}

.topbar {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.eyebrow {
  display: block;
  color: #66736d;
  font-size: 24rpx;
}

.message-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  color: #ffffff;
  background: #e36f4b;
  border-radius: 50%;
  font-weight: 800;
}

.balance-card {
  align-items: flex-end;
  justify-content: space-between;
  min-height: 210rpx;
  padding: 34rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #0f766e, #2563eb);
  border-radius: 16rpx;
}

.balance-label,
.balance-status {
  color: rgba(255, 255, 255, 0.82);
  font-size: 26rpx;
}

.balance-line {
  margin-top: 8rpx;
}

.balance-num {
  font-size: 86rpx;
  font-weight: 900;
  line-height: 1;
}

.balance-unit {
  margin-left: 8rpx;
  font-size: 28rpx;
}

.quick-grid {
  justify-content: space-between;
  gap: 14rpx;
  margin: 18rpx 0;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 8rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.quick-icon {
  color: #0f766e;
  font-size: 34rpx;
  font-weight: 900;
}

.section {
  margin-top: 24rpx;
}

.section-head {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  color: #17201d;
  font-size: 34rpx;
  font-weight: 800;
}

.link {
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 700;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.empty-box,
.history-strip {
  padding: 32rpx;
  color: #66736d;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.empty-box button {
  height: 70rpx;
  margin-top: 18rpx;
  color: #ffffff;
  background: #0f766e;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 70rpx;
}
</style>
