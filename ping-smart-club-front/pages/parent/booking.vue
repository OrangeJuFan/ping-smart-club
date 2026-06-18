<template>
  <view class="page">
    <view class="title-row">
      <text class="page-title">课程预约</text>
    </view>

    <view class="filter-card">
      <scroll-view scroll-x class="type-scroll">
        <view class="type-row">
          <view
            v-for="item in typeOptions"
            :key="item.value"
            class="type-chip"
            :class="{ active: filters.courseTypeCode === item.value }"
            @click="setType(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </scroll-view>

      <scroll-view scroll-x class="date-scroll">
        <view class="date-row">
          <view
            v-for="item in dateOptions"
            :key="item.value"
            class="date-chip"
            :class="{ active: filters.date === item.value }"
            @click="setDate(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </scroll-view>

      <picker :range="coachNames" :value="coachIndex" @change="setCoach">
        <view class="picker-line">
          <text>教练</text>
          <text>{{ coachNames[coachIndex] }}</text>
        </view>
      </picker>
    </view>

    <view class="list">
      <course-card
        v-for="item in schedules"
        :key="item.schedule.id"
        :item="item"
        @detail="goDetail"
        @book="bookCourse"
        @waitlist="bookCourse"
      />
      <view v-if="!loading && !schedules.length" class="empty-box">
        <text>暂无可预约课程</text>
      </view>
    </view>

    <custom-tabbar :user-role="'parent'" :current="1" />
  </view>
</template>

<script>
import parentMock from '@/services/parentMock'
import CustomTabbar from '@/pages/components/custom-tabbar.vue'
import CourseCard from '@/components/parent/course-card.vue'

export default {
  components: {
    CustomTabbar,
    CourseCard
  },
  data() {
    const dateOptions = parentMock.getDateOptions(7)
    return {
      loading: false,
      dateOptions,
      meta: {
        courseTypes: [],
        coaches: []
      },
      filters: {
        date: dateOptions[0] ? dateOptions[0].value : '',
        courseTypeCode: 'all',
        coachId: ''
      },
      schedules: []
    }
  },
  computed: {
    typeOptions() {
      return [{ label: '全部', value: 'all' }].concat(this.meta.courseTypes.map(item => ({
        label: item.name,
        value: item.code
      })))
    },
    coachNames() {
      return ['全部教练'].concat(this.meta.coaches.map(item => `${item.name} · ${item.title}`))
    },
    coachIndex() {
      const index = this.meta.coaches.findIndex(item => item.id === this.filters.coachId)
      return index >= 0 ? index + 1 : 0
    }
  },
  onShow() {
    this.loadPage()
  },
  methods: {
    async loadPage() {
      this.loading = true
      try {
        const session = await parentMock.getSession()
        if (!session.guardian) {
          uni.reLaunch({ url: '/pages/login/login' })
          return
        }
        this.meta = await parentMock.getScheduleMeta()
        await this.loadSchedules()
      } catch (error) {
        this.toast(error.message || '加载失败')
      } finally {
        this.loading = false
      }
    },
    async loadSchedules() {
      this.schedules = await parentMock.listSchedules(this.filters)
    },
    setType(value) {
      this.filters.courseTypeCode = value
      this.loadSchedules()
    },
    setDate(value) {
      this.filters.date = value
      this.loadSchedules()
    },
    setCoach(event) {
      const index = Number(event.detail.value)
      this.filters.coachId = index > 0 ? this.meta.coaches[index - 1].id : ''
      this.loadSchedules()
    },
    goDetail(scheduleId) {
      uni.navigateTo({ url: `/pages/parent/course-detail?id=${scheduleId}` })
    },
    async bookCourse(scheduleId) {
      try {
        const result = await parentMock.createBooking(scheduleId)
        this.toast(result.booking.status === 'waitlisted' ? '已加入候补' : '预约成功', 'success')
        await this.loadSchedules()
      } catch (error) {
        this.toast(error.message || '预约失败')
      }
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
  padding: 24rpx 24rpx 140rpx;
  background: #f7f8f4;
}

.title-row {
  margin-bottom: 22rpx;
}

.page-title {
  color: #17201d;
  font-size: 44rpx;
  font-weight: 900;
}

.filter-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 22rpx;
  background: #ffffff;
  border: 1rpx solid #dce4de;
  border-radius: 16rpx;
}

.type-row,
.date-row {
  display: flex;
  gap: 14rpx;
  min-width: max-content;
}

.type-chip,
.date-chip {
  padding: 16rpx 24rpx;
  color: #66736d;
  background: #f3f6f2;
  border: 1rpx solid #dce4de;
  border-radius: 12rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.type-chip.active,
.date-chip.active {
  color: #ffffff;
  background: #0f766e;
  border-color: #0f766e;
}

.picker-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
  padding: 0 18rpx;
  color: #17201d;
  background: #f6f8f3;
  border-radius: 12rpx;
  font-size: 28rpx;
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
