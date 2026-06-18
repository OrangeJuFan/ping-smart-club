<template>
  <view class="page">
    <view class="nav-row">
      <button class="back-btn" @click="goBack">返回</button>
      <text class="page-title">消息通知</text>
    </view>

    <view class="mode-row">
      <button class="mode-btn" :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
      <button class="mode-btn" :class="{ active: filter === 'unread' }" @click="filter = 'unread'">未读</button>
    </view>

    <view class="list">
      <view
        v-for="item in filteredMessages"
        :key="item.id"
        class="message-card"
        :class="{ unread: item.status === 'unread' }"
        @click="markRead(item)"
      >
        <view class="message-head">
          <text class="message-title">{{ item.title }}</text>
          <status-pill :status="item.status" />
        </view>
        <text class="message-content">{{ item.content }}</text>
        <view class="message-foot">
          <text>{{ typeLabel(item.type) }}</text>
          <text>{{ formatDateLabel(item.createdAt) }} {{ formatClock(item.createdAt) }}</text>
        </view>
      </view>
      <view v-if="!filteredMessages.length" class="empty-box">
        <text>暂无消息</text>
      </view>
    </view>
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
      filter: 'all',
      messages: []
    }
  },
  computed: {
    filteredMessages() {
      if (this.filter === 'unread') return this.messages.filter(item => item.status === 'unread')
      return this.messages
    }
  },
  onShow() {
    this.loadMessages()
  },
  methods: {
    formatClock: parentMock.formatClock,
    formatDateLabel: parentMock.formatDateLabel,
    async loadMessages() {
      try {
        this.messages = await parentMock.listMessages()
      } catch (error) {
        this.toast(error.message || '加载失败')
      }
    },
    async markRead(item) {
      if (item.status === 'read') return
      try {
        await parentMock.markMessageRead(item.id)
        await this.loadMessages()
      } catch (error) {
        this.toast(error.message || '操作失败')
      }
    },
    typeLabel(type) {
      const labels = {
        'booking-success': '预约成功',
        'booking-cancelled': '取消预约',
        'schedule-changed': '调课通知',
        'class-reminder': '课前提醒',
        waitlist: '候补提醒',
        bind: '绑定通知'
      }
      return labels[type] || '系统消息'
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
.mode-row,
.message-head,
.message-foot {
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

.mode-row {
  gap: 12rpx;
  padding: 8rpx;
  background: #e8eee9;
  border-radius: 14rpx;
}

.mode-btn {
  flex: 1;
  height: 68rpx;
  margin: 0;
  color: #66736d;
  background: transparent;
  border-radius: 10rpx;
  font-size: 28rpx;
  line-height: 68rpx;
}

.mode-btn.active {
  color: #0f766e;
  background: #ffffff;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 22rpx;
}

.message-card,
.empty-box {
  padding: 26rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
}

.message-card.unread {
  background: #fffdf7;
  border-color: #f1d28c;
}

.message-head,
.message-foot {
  justify-content: space-between;
  gap: 20rpx;
}

.message-title {
  color: #17201d;
  font-size: 32rpx;
  font-weight: 800;
}

.message-content {
  display: block;
  margin-top: 14rpx;
  color: #3d4843;
  font-size: 28rpx;
}

.message-foot {
  margin-top: 16rpx;
  color: #66736d;
  font-size: 24rpx;
}

.empty-box {
  color: #66736d;
  text-align: center;
}
</style>
