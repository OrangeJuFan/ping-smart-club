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

    <uni-card title="课时明细" :is-shadow="true">
      <uni-list v-if="creditRecords.length">
        <uni-list-item
          v-for="item in creditRecords"
          :key="item.id"
          :title="item.title"
          :note="formatDateLabel(item.createdAt) + ' ' + formatClock(item.createdAt) + ' · 余额 ' + item.balanceAfter"
          :right-text="signedAmount(item.amount)"
        />
      </uni-list>
      <view v-else class="empty-box"><text>暂无课时明细</text></view>
    </uni-card>

    <uni-card title="已完成课程" :is-shadow="true">
      <uni-list v-if="completedBookings.length">
        <uni-list-item
          v-for="item in completedBookings"
          :key="item.booking.id"
          :title="item.courseType.name"
          :note="formatTimeRange(item.schedule.startTime, item.schedule.endTime) + ' · ' + item.coach.name"
          :right-text="item.courseType.creditCost + ' 课时'"
        />
      </uni-list>
      <view v-else class="empty-box"><text>暂无已完成课程</text></view>
    </uni-card>

    <uni-card title="成长记录" :is-shadow="true">
      <uni-list v-if="growthRecords.length">
        <uni-list-item
          v-for="item in growthRecords"
          :key="item.id"
          :title="item.title"
          :note="item.remark + ' · ' + formatDateLabel(item.createdAt) + ' ' + formatClock(item.createdAt)"
          :right-text="item.level"
        />
      </uni-list>
      <view v-else class="empty-box"><text>暂无成长记录</text></view>
    </uni-card>
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

.page-title {
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

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-box {
  padding: 26rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
}

.row-meta,
.growth-text {
  display: block;
  margin-top: 8rpx;
  color: #66736d;
  font-size: 24rpx;
}

.empty-box {
  color: #66736d;
  text-align: center;
  font-size: 28rpx;
}
</style>
