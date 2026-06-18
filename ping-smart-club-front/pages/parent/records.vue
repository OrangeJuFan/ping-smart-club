<template>
  <view class="page">
    <view class="nav-row">
      <button class="back-btn" @click="goBack">返回</button>
      <text class="page-title">课时与成长</text>
    </view>

    <view v-if="summary" class="balance-card">
      <view>
        <text class="balance-label">当前余额</text>
        <view class="balance-line">
          <text class="balance-num">{{ summary.student.balance }}</text>
          <text class="balance-unit">课时</text>
        </view>
      </view>
      <text class="balance-status">{{ summary.student.level }}</text>
    </view>

    <view class="section">
      <text class="section-title">课时明细</text>
      <view v-if="creditRecords.length" class="list">
        <view v-for="item in creditRecords" :key="item.id" class="row-card">
          <view>
            <text class="row-title">{{ item.title }}</text>
            <text class="row-meta">{{ formatDateLabel(item.createdAt) }} {{ formatClock(item.createdAt) }} · 余额 {{ item.balanceAfter }}</text>
          </view>
          <text class="amount" :class="{ plus: item.amount > 0 }">{{ signedAmount(item.amount) }}</text>
        </view>
      </view>
      <view v-else class="empty-box"><text>暂无课时明细</text></view>
    </view>

    <view class="section">
      <text class="section-title">已完成课程</text>
      <view v-if="completedBookings.length" class="list">
        <view v-for="item in completedBookings" :key="item.booking.id" class="row-card">
          <view>
            <text class="row-title">{{ item.courseType.name }}</text>
            <text class="row-meta">{{ formatTimeRange(item.schedule.startTime, item.schedule.endTime) }} · {{ item.coach.name }}</text>
          </view>
          <text class="amount">{{ item.courseType.creditCost }} 课时</text>
        </view>
      </view>
      <view v-else class="empty-box"><text>暂无已完成课程</text></view>
    </view>

    <view class="section">
      <text class="section-title">成长记录</text>
      <view v-if="growthRecords.length" class="list">
        <view v-for="item in growthRecords" :key="item.id" class="growth-card">
          <view class="growth-head">
            <text class="row-title">{{ item.title }}</text>
            <text class="level">{{ item.level }}</text>
          </view>
          <text class="growth-text">{{ item.remark }}</text>
          <text class="row-meta">{{ formatDateLabel(item.createdAt) }} {{ formatClock(item.createdAt) }}</text>
        </view>
      </view>
      <view v-else class="empty-box"><text>暂无成长记录</text></view>
    </view>
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'

export default {
  data() {
    return {
      summary: null,
      creditRecords: [],
      completedBookings: [],
      growthRecords: []
    }
  },
  onShow() {
    this.loadPage()
  },
  methods: {
    formatClock: parentMock.formatClock,
    formatDateLabel: parentMock.formatDateLabel,
    formatTimeRange: parentMock.formatTimeRange,
    async loadPage() {
      try {
        const session = await parentMock.getSession()
        if (!session.guardian) {
          uni.reLaunch({ url: '/pages/login/login' })
          return
        }
        this.summary = await parentMock.getHomeSummary()
        this.creditRecords = await parentMock.listCreditRecords()
        this.completedBookings = await parentMock.listBookings('completed')
        this.growthRecords = await parentMock.listGrowthRecords()
      } catch (error) {
        this.toast(error.message || '加载失败')
      }
    },
    signedAmount(amount) {
      return `${amount > 0 ? '+' : ''}${amount}`
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
.balance-card,
.row-card,
.growth-head {
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

.page-title,
.section-title {
  color: #17201d;
  font-weight: 900;
}

.page-title {
  font-size: 40rpx;
}

.balance-card {
  justify-content: space-between;
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

.balance-num {
  font-size: 76rpx;
  font-weight: 900;
}

.balance-unit {
  margin-left: 8rpx;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 28rpx;
}

.section-title {
  font-size: 34rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.row-card,
.growth-card,
.empty-box {
  padding: 26rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
}

.row-card,
.growth-head {
  justify-content: space-between;
  gap: 20rpx;
}

.row-title {
  display: block;
  color: #17201d;
  font-size: 30rpx;
  font-weight: 800;
}

.row-meta,
.growth-text {
  display: block;
  margin-top: 8rpx;
  color: #66736d;
  font-size: 24rpx;
}

.amount {
  color: #e36f4b;
  font-size: 28rpx;
  font-weight: 900;
  white-space: nowrap;
}

.amount.plus {
  color: #0f766e;
}

.level {
  color: #2563eb;
  font-size: 24rpx;
  font-weight: 800;
}

.empty-box {
  color: #66736d;
  text-align: center;
  font-size: 28rpx;
}
</style>
