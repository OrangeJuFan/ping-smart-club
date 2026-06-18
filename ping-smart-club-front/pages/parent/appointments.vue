<template>
  <view class="page">
    <view class="nav-row">
      <button class="back-btn" @click="goBack">返回</button>
      <text class="page-title">我的预约</text>
    </view>

    <scroll-view scroll-x class="tab-scroll">
      <view class="tab-row">
        <view
          v-for="item in tabs"
          :key="item.value"
          class="tab-chip"
          :class="{ active: activeStatus === item.value }"
          @click="setStatus(item.value)"
        >
          <text>{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="list">
      <booking-card
        v-for="item in bookings"
        :key="item.booking.id"
        :item="item"
        @cancel="cancelBooking"
        @checkin="checkIn"
      />
      <view v-if="!loading && !bookings.length" class="empty-box">
        <text>暂无预约记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import BookingCard from '@/components/parent/booking-card.vue'

export default {
  components: {
    BookingCard
  },
  data() {
    return {
      loading: false,
      activeStatus: 'all',
      tabs: [
        { label: '全部', value: 'all' },
        { label: '待上课', value: 'booked' },
        { label: '候补中', value: 'waitlisted' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' }
      ],
      bookings: []
    }
  },
  onShow() {
    this.loadBookings()
  },
  methods: {
    async loadBookings() {
      this.loading = true
      try {
        this.bookings = await parentMock.listBookings(this.activeStatus)
      } catch (error) {
        this.toast(error.message || '加载失败')
      } finally {
        this.loading = false
      }
    },
    setStatus(status) {
      this.activeStatus = status
      this.loadBookings()
    },
    cancelBooking(bookingId) {
      uni.showModal({
        title: '取消预约',
        content: '确认取消这节课程预约吗？',
        success: async res => {
          if (!res.confirm) return
          try {
            await parentMock.cancelBooking(bookingId)
            this.toast('预约已取消', 'success')
            this.loadBookings()
          } catch (error) {
            this.toast(error.message || '取消失败')
          }
        }
      })
    },
    async checkIn(bookingId) {
      try {
        await parentMock.checkIn(bookingId)
        this.toast('签到成功', 'success')
        this.loadBookings()
      } catch (error) {
        this.toast(error.message || '签到失败')
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

.nav-row {
  display: flex;
  align-items: center;
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

.tab-row {
  display: flex;
  gap: 14rpx;
  min-width: max-content;
}

.tab-chip {
  padding: 16rpx 24rpx;
  color: #66736d;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 12rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.tab-chip.active {
  color: #ffffff;
  background: #0f766e;
  border-color: #0f766e;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 22rpx;
}

.empty-box {
  padding: 42rpx;
  color: #66736d;
  text-align: center;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
}
</style>
