<template>
  <view class="page">
    <page-nav title="消息通知" @back="goBack" />

    <uni-segmented-control
      :current="filter === 'all' ? 0 : 1"
      :values="['全部', '未读']"
      style-type="button"
      active-color="#0f766e"
      @clickItem="changeFilter"
    />

    <uni-list v-if="filteredMessages.length" class="list">
      <uni-list-item
        v-for="item in filteredMessages"
        :key="item.id"
        clickable
        :title="item.title"
        :note="messageNote(item)"
        :right-text="item.status === 'unread' ? '未读' : '已读'"
        @click="markRead(item)"
      />
    </uni-list>
    <view v-else class="list">
      <view v-if="!filteredMessages.length" class="empty-box">
        <text>暂无消息</text>
      </view>
    </view>
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import PageNav from '@/components/parent/page-nav.vue'

export default {
  components: {
    PageNav
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
    changeFilter(event) {
      this.filter = event.currentIndex === 0 ? 'all' : 'unread'
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
    messageNote(item) {
      return `${item.content} · ${this.typeLabel(item.type)} · ${this.formatDateLabel(item.createdAt)} ${this.formatClock(item.createdAt)}`
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

.list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 22rpx;
}

.empty-box {
  padding: 26rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
}

.empty-box {
  color: #66736d;
  text-align: center;
}
</style>
