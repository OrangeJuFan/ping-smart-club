<template>
  <view class="course-card" @click="$emit('detail', item.schedule.id)">
    <view class="card-head">
      <view class="title-box">
        <view class="title-line">
          <text class="course-name">{{ item.courseType.name }}</text>
          <status-pill :status="item.isFull ? 'full' : 'open'" />
        </view>
        <text class="course-desc">{{ item.courseType.duration }} 分钟 · {{ item.courseType.creditCost }} 课时</text>
      </view>
      <text class="credit">{{ item.courseType.shortName }}</text>
    </view>

    <view class="meta-list">
      <text>{{ formatTimeRange(item.schedule.startTime, item.schedule.endTime) }}</text>
      <text>{{ item.coach.name }} · {{ item.coach.title }}</text>
      <text>{{ item.venue.name }} · {{ item.venue.address }}</text>
      <text>{{ item.isFull ? '候补 ' + item.schedule.waitlistCount + ' 人' : '剩余 ' + item.remainingSeats + ' 名' }}</text>
    </view>

    <view v-if="item.schedule.note" class="note">
      <text>{{ item.schedule.note }}</text>
    </view>

    <view class="actions" @click.stop>
      <button class="ghost-btn" @click="$emit('detail', item.schedule.id)">详情</button>
      <button class="primary-btn" :disabled="item.hasActiveBooking" @click="handleAction">
        {{ actionText }}
      </button>
    </view>
  </view>
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
.course-card {
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
.meta-list text,
.note {
  color: #66736d;
  font-size: 26rpx;
}

.credit {
  color: #e36f4b;
  font-size: 30rpx;
  font-weight: 800;
}

.meta-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  margin-top: 22rpx;
}

.note {
  margin-top: 20rpx;
  padding: 18rpx;
  background: #f4f7ef;
  border-radius: 12rpx;
}

.actions {
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 24rpx;
}

.ghost-btn,
.primary-btn {
  height: 68rpx;
  margin: 0;
  padding: 0 26rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  line-height: 68rpx;
}

.ghost-btn {
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
