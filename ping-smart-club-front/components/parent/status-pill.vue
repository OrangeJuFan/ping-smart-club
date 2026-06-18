<template>
  <view class="status-pill" :class="toneClass">
    <text>{{ label }}</text>
  </view>
</template>

<script>
const labels = {
  booked: '待上课',
  completed: '已完成',
  cancelled: '已取消',
  waitlisted: '候补中',
  open: '可预约',
  full: '满员',
  unread: '未读',
  read: '已读'
}

export default {
  name: 'StatusPill',
  props: {
    status: {
      type: String,
      default: ''
    },
    tone: {
      type: String,
      default: ''
    }
  },
  computed: {
    label() {
      return labels[this.status] || this.status
    },
    toneClass() {
      if (this.tone) return this.tone
      if (this.status === 'booked' || this.status === 'open') return 'success'
      if (this.status === 'waitlisted' || this.status === 'full' || this.status === 'unread') return 'warning'
      if (this.status === 'cancelled' || this.status === 'read') return 'muted'
      return 'neutral'
    }
  }
}
</script>

<style lang="scss" scoped>
.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 42rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
  white-space: nowrap;
}

.success {
  color: #0f766e;
  background: #dff3ee;
}

.warning {
  color: #a66400;
  background: #fff3d8;
}

.neutral {
  color: #2563eb;
  background: #e9f0ff;
}

.muted {
  color: #69756f;
  background: #eef1ee;
}
</style>
