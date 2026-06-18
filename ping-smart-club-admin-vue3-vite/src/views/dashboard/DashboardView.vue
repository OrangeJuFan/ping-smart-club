<script setup lang="ts">
import { BellRing, RefreshCw } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import CalendarSchedule, { type CalendarEvent } from '@/components/CalendarSchedule.vue';
import StatCard from '@/components/StatCard.vue';
import type { Coach, CourseProduct, DashboardMetrics, Schedule, Venue } from '@/types/domain';
import { formatTime } from '@/utils/date';

const loading = ref(false);
const metrics = ref<DashboardMetrics | null>(null);
const schedules = ref<Schedule[]>([]);
const products = ref<CourseProduct[]>([]);
const coaches = ref<Coach[]>([]);
const venues = ref<Venue[]>([]);

const load = async () => {
  loading.value = true;
  try {
    const [dashboardResp, scheduleResp] = await Promise.all([adminApi.getDashboard(), adminApi.getSchedules()]);
    metrics.value = dashboardResp.data;
    schedules.value = scheduleResp.data.schedules;
    products.value = scheduleResp.data.products;
    coaches.value = scheduleResp.data.coaches;
    venues.value = scheduleResp.data.venues;
  } finally {
    loading.value = false;
  }
};

const findProduct = (id: string) => products.value.find((item) => item.id === id)?.name || '未知课程';
const findCoach = (id: string) => coaches.value.find((item) => item.id === id)?.name || '未分配教练';
const findVenue = (id: string) => venues.value.find((item) => item.id === id)?.name || '未分配场地';

const calendarEvents = computed<CalendarEvent[]>(() =>
  schedules.value.map((schedule) => ({
    id: schedule.id,
    title: findProduct(schedule.productId),
    subtitle: `${findCoach(schedule.coachId)} · ${findVenue(schedule.venueId)} · ${schedule.bookedCount}/${schedule.capacity}`,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    status: schedule.status,
  })),
);

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">首页看板</h1>
        <p class="page-description">第一阶段聚焦今日课程、预约、签到、低课时和取消/候补提醒。</p>
      </div>
      <BaseButton :loading="loading" @click="load">
        <template #icon><RefreshCw /></template>
        刷新
      </BaseButton>
    </header>

    <div class="stat-grid">
      <StatCard label="今日课程数" :value="metrics?.todayCourseCount ?? '-'" tone="teal" hint="按课程安排开始时间统计" />
      <StatCard label="今日预约人数" :value="metrics?.todayBookingCount ?? '-'" tone="blue" hint="不含已取消预约" />
      <StatCard label="今日待上课人数" :value="metrics?.todayPendingClassCount ?? '-'" tone="orange" hint="待上课课程场次数" />
      <StatCard label="今日已签到人数" :value="metrics?.todayCheckedInCount ?? '-'" tone="green" hint="学员与教练签到合计" />
      <StatCard label="课时余额不足学员" :value="metrics?.lowBalanceStudentCount ?? '-'" tone="orange" hint="低于系统阈值自动提醒" />
    </div>

    <div class="grid grid-2">
      <BaseCard title="近期课表" subtitle="支持日/周视图的课表组件，第一阶段在看板和排课中复用。">
        <CalendarSchedule :events="calendarEvents" mode="week" />
      </BaseCard>

      <BaseCard title="最近取消 / 候补提醒">
        <ul class="reminder-list">
          <li v-for="item in metrics?.reminders || []" :key="item.id">
            <BellRing aria-hidden="true" />
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.content }}</p>
              <span>{{ item.time }}</span>
            </div>
          </li>
          <li v-if="!metrics?.reminders.length" class="empty-reminder">暂无提醒</li>
        </ul>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.reminder-list li {
  display: flex;
  gap: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px;
}

.reminder-list svg {
  width: 18px;
  height: 18px;
  color: var(--color-warning);
  flex: 0 0 auto;
}

.reminder-list strong {
  display: block;
  font-size: 14px;
}

.reminder-list p,
.reminder-list span {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.empty-reminder {
  justify-content: center;
  color: var(--color-text-muted);
}

@media (max-width: 1120px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
