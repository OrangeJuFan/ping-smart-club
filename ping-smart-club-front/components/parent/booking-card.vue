<template>
  <uni-card :title="item.courseType.name" :extra="item.courseType.creditCost + ' 课时'" :is-shadow="true">
    <view class="card-head">
      <text class="course-desc">{{ item.coach.name }} · {{ item.venue.name }}</text>
      <status-pill :status="item.booking.status" />
    </view>

    <view class="meta-list">
      <view class="meta-line">
        <uni-icons type="calendar" size="16" color="#66736d" />
        <text>{{ formatTimeRange(item.schedule.startTime, item.schedule.endTime) }}</text>
      </view>
      <view class="meta-line">
        <uni-icons type="location" size="16" color="#66736d" />
        <text>{{ item.venue.address }}</text>
      </view>
      <view v-if="item.booking.waitlistRank" class="meta-line">
        <uni-icons type="info" size="16" color="#66736d" />
        <text>候补第 {{ item.booking.waitlistRank }} 位</text>
      </view>
      <view v-if="item.booking.checkedInAt" class="meta-line">
        <uni-icons type="checkbox-filled" size="16" color="#0f766e" />
        <text>已于 {{ formatClock(item.booking.checkedInAt) }} 签到</text>
      </view>
    </view>

    <view v-if="canCancel || signInState.visible" class="actions">
      <button
        v-if="signInState.visible"
        class="plain-btn"
        :disabled="!signInState.enabled"
        @click="$emit('checkin', item.booking.id)"
      >
        {{ signInState.label }}
      </button>
      <button v-if="canCancel" class="danger-btn" @click="$emit('cancel', item.booking.id)">取消预约</button>
    </view>
  </uni-card>
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
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 18rpx;
}

.course-desc,
.meta-line text {
  color: #66736d;
  font-size: 26rpx;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
}

.plain-btn,
.danger-btn {
  height: 68rpx;
  margin: 0;
  padding: 0 24rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 68rpx;
}

.plain-btn {
  color: #0f766e;
  background: #edf4f1;
}

.danger-btn {
  color: #c2413b;
  background: #fff2f0;
}

.plain-btn[disabled] {
  color: #889690;
  background: #eef1ee;
}
</style>
