<template>
  <uni-card :title="item.courseType.name" :extra="item.courseType.shortName" :is-shadow="true" @click="$emit('detail', item.schedule.id)">
    <view class="card-head">
      <text class="course-desc">{{ item.courseType.duration }} 分钟 · {{ item.courseType.creditCost }} 课时</text>
      <status-pill :status="item.isFull ? 'full' : 'open'" />
    </view>

    <view class="meta-list">
      <view class="meta-line">
        <uni-icons type="calendar" size="16" color="#66736d" />
        <text>{{ formatTimeRange(item.schedule.startTime, item.schedule.endTime) }}</text>
      </view>
      <view class="meta-line">
        <uni-icons type="person" size="16" color="#66736d" />
        <text>{{ item.coach.name }} · {{ item.coach.title }}</text>
      </view>
      <view class="meta-line">
        <uni-icons type="location" size="16" color="#66736d" />
        <text>{{ item.venue.name }} · {{ item.venue.address }}</text>
      </view>
      <view class="meta-line">
        <uni-icons type="staff" size="16" color="#66736d" />
        <text>{{ item.isFull ? '候补 ' + item.schedule.waitlistCount + ' 人' : '剩余 ' + item.remainingSeats + ' 名' }}</text>
      </view>
    </view>

    <uni-notice-bar v-if="item.schedule.note" :text="item.schedule.note" single show-icon />

    <view class="actions" @click.stop>
      <button class="plain-btn" @click="$emit('detail', item.schedule.id)">详情</button>
      <button class="primary-btn" :disabled="item.hasActiveBooking" @click="handleAction">
        {{ actionText }}
      </button>
    </view>
  </uni-card>
</template>

<script>
import parentMock from '@/services/parentMock'
import StatusPill from './status-pill.vue'

export default {
  name: 'CourseCard',
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
    actionText() {
      if (this.item.hasActiveBooking) {
        return this.item.activeBooking && this.item.activeBooking.status === 'waitlisted' ? '已候补' : '已预约'
      }
      return this.item.isFull ? '加入候补' : '确认预约'
    }
  },
  methods: {
    formatTimeRange: parentMock.formatTimeRange,
    handleAction() {
      if (this.item.hasActiveBooking) return
      this.$emit(this.item.isFull ? 'waitlist' : 'book', this.item.schedule.id)
    }
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
  margin-bottom: 16rpx;
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
  margin-top: 18rpx;
}

.plain-btn,
.primary-btn {
  height: 68rpx;
  margin: 0;
  padding: 0 26rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 68rpx;
}

.plain-btn {
  color: #17201d;
  background: #f5f7f3;
}

.primary-btn {
  color: #ffffff;
  background: #0f766e;
}

.primary-btn[disabled] {
  color: #ffffff;
  background: #9aa8a2;
}
</style>
