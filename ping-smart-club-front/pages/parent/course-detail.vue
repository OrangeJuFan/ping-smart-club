<template>
  <view class="page">
    <view class="nav-row">
      <button class="back-btn" @click="goBack">返回</button>
      <text class="page-title">课程详情</text>
    </view>

    <view v-if="detail" class="hero-card">
      <view class="hero-head">
        <text class="course-name">{{ detail.courseType.name }}</text>
        <status-pill :status="detail.isFull ? 'full' : 'open'" />
      </view>
      <text class="hero-desc">{{ detail.courseType.duration }} 分钟 · 消耗 {{ detail.courseType.creditCost }} 课时</text>
      <text class="hero-note">{{ detail.schedule.note }}</text>
    </view>

    <uni-list v-if="detail" class="info-list">
      <uni-list-item title="时间" :right-text="formatTimeRange(detail.schedule.startTime, detail.schedule.endTime)" />
      <uni-list-item title="教练" :right-text="detail.coach.name + ' · ' + detail.coach.title" />
      <uni-list-item title="场地" :note="detail.venue.address" :right-text="detail.venue.name" />
      <uni-list-item title="名额" :right-text="detail.isFull ? '满员，候补 ' + detail.schedule.waitlistCount + ' 人' : '剩余 ' + detail.remainingSeats + ' 名'" />
    </uni-list>

    <view v-if="needMoreCredits" class="warning-card">
      <text>当前课时余额不足，本课程需 {{ detail.courseType.creditCost }} 课时。</text>
    </view>

    <button v-if="detail" class="primary-btn" :disabled="detail.hasActiveBooking || needMoreCredits" @click="bookCourse">
      {{ actionText }}
    </button>
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import StatusPill from '@/components/parent/status-pill.vue'

export default {
  components: {
    StatusPill
  },
  data() {
    return {
      scheduleId: '',
      detail: null,
      session: null
    }
  },
  computed: {
    selectedStudent() {
      if (!this.session || !this.session.students) return null
      return this.session.students.find(item => item.id === this.session.selectedStudentId) || null
    },
    needMoreCredits() {
      if (!this.detail || !this.selectedStudent || this.detail.isFull) return false
      return this.selectedStudent.balance < this.detail.courseType.creditCost
    },
    actionText() {
      if (this.detail.hasActiveBooking) {
        return this.detail.activeBooking && this.detail.activeBooking.status === 'waitlisted' ? '已在候补中' : '已预约'
      }
      if (this.needMoreCredits) return '余额不足'
      return this.detail.isFull ? '加入候补' : '确认预约'
    }
  },
  onLoad(options) {
    this.scheduleId = options.id || ''
    this.loadDetail()
  },
  methods: {
    formatTimeRange: parentMock.formatTimeRange,
    async loadDetail() {
      try {
        this.session = await parentMock.getSession()
        this.detail = await parentMock.getScheduleDetail(this.scheduleId)
      } catch (error) {
        this.toast(error.message || '加载失败')
      }
    },
    async bookCourse() {
      try {
        const result = await parentMock.createBooking(this.scheduleId)
        this.toast(result.booking.status === 'waitlisted' ? '已加入候补' : '预约成功', 'success')
        await this.loadDetail()
      } catch (error) {
        this.toast(error.message || '预约失败')
      }
    },
    goBack() {
      uni.navigateBack()
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
  padding: 24rpx;
  background: #f7f8f4;
}

.nav-row,
.hero-head {
  display: flex;
  align-items: center;
}

.nav-row {
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.back-btn {
  width: 118rpx;
  height: 62rpx;
  margin: 0;
  color: #17201d;
  background: #ffffff;
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 62rpx;
}

.page-title {
  color: #17201d;
  font-size: 40rpx;
  font-weight: 900;
}

.hero-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 34rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #0f766e, #e36f4b);
  border-radius: 16rpx;
}

.hero-head {
  justify-content: space-between;
}

.course-name {
  font-size: 46rpx;
  font-weight: 900;
}

.hero-desc,
.hero-note {
  color: rgba(255, 255, 255, 0.86);
  font-size: 28rpx;
}

.info-list {
  margin-top: 22rpx;
}

.warning-card {
  margin-top: 22rpx;
  padding: 22rpx;
  color: #a66400;
  background: #fff3d8;
  border-radius: 14rpx;
  font-size: 28rpx;
}

.primary-btn {
  height: 88rpx;
  margin: 28rpx 0 0;
  color: #ffffff;
  background: #0f766e;
  border-radius: 14rpx;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 88rpx;
}

.primary-btn[disabled] {
  background: #9aa8a2;
}
</style>
