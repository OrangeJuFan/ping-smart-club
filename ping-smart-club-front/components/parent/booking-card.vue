<template>
  <view class="booking-card">
    <view class="card-head">
      <view class="title-box">
        <view class="title-line">
          <text class="course-name">{{ item.courseType.name }}</text>
          <status-pill :status="item.booking.status" />
        </view>
        <text class="course-desc">{{ item.coach.name }} · {{ item.venue.name }}</text>
      </view>
      <text class="credit">{{ item.courseType.creditCost }} 课时</text>
    </view>

    <view class="meta-list">
      <text>{{ formatTimeRange(item.schedule.startTime, item.schedule.endTime) }}</text>
      <text>{{ item.venue.address }}</text>
      <text v-if="item.booking.waitlistRank">候补第 {{ item.booking.waitlistRank }} 位</text>
      <text v-if="item.booking.checkedInAt">已于 {{ formatClock(item.booking.checkedInAt) }} 签到</text>
    </view>

    <view v-if="canCancel || signInState.visible" class="actions">
      <button
        v-if="signInState.visible"
        class="ghost-btn"
        :disabled="!signInState.enabled"
        @click="$emit('checkin', item.booking.id)"
      >
        {{ signInState.label }}
      </button>
      <button v-if="canCancel" class="danger-btn" @click="$emit('cancel', item.booking.id)">取消预约</button>
    </view>
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import StatusPill from './status-pill.vue'

export default {
  name: 'BookingCard',
  components: {
    StatusPill
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    signInState() {
      return parentMock.getSignInState(this.item)
    },
    canCancel() {
      return this.item.booking.status === 'booked' || this.item.booking.status === 'waitlisted'
    }
  },
  methods: {
    formatTimeRange: parentMock.formatTimeRange,
    formatClock: parentMock.formatClock
  }
}
</script>

<style lang="scss" scoped>
.booking-card {
  padding: 28rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
  box-shadow: 0 10rpx 24rpx rgba(27, 45, 38, 0.08);
}

.card-head,
.title-line,
.actions {
  display: flex;
  align-items: center;
}

.card-head {
  justify-content: space-between;
  gap: 20rpx;
}

.title-box {
  flex: 1;
  min-width: 0;
}

.title-line {
  gap: 14rpx;
}

.course-name {
  color: #17201d;
  font-size: 34rpx;
  font-weight: 800;
}

.course-desc,
.meta-list text {
  color: #66736d;
  font-size: 26rpx;
}

.credit {
  color: #e36f4b;
  font-size: 28rpx;
  font-weight: 800;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 22rpx;
}

.actions {
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 24rpx;
}

.ghost-btn,
.danger-btn {
  height: 68rpx;
  margin: 0;
  padding: 0 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 68rpx;
}

.ghost-btn {
  color: #0f766e;
  background: #edf4f1;
}

.danger-btn {
  color: #c2413b;
  background: #fff2f0;
}

.ghost-btn[disabled] {
  color: #889690;
  background: #eef1ee;
}
</style>
