<script setup lang="ts">
import { Check, RefreshCw, Umbrella, X } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import StatCard from '@/components/StatCard.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { Attendance, Coach, CourseProduct, Schedule, Student } from '@/types/domain';
import { formatDateTime, sameDate } from '@/utils/date';
import { includesText, percent } from '@/utils/format';

const attendance = ref<Attendance[]>([]);
const schedules = ref<Schedule[]>([]);
const students = ref<Student[]>([]);
const coaches = ref<Coach[]>([]);
const products = ref<CourseProduct[]>([]);
const keyword = ref('');
const roleFilter = ref<'all' | 'student' | 'coach'>('all');
const loading = ref(false);

const recordColumns: TableColumn[] = [
  { key: 'person', label: '人员' },
  { key: 'roleText', label: '类型' },
  { key: 'course', label: '课程' },
  { key: 'classTime', label: '上课时间' },
  { key: 'checkedAt', label: '签到时间' },
  { key: 'status', label: '状态', width: '96px' },
];

const pendingColumns: TableColumn[] = [
  { key: 'course', label: '课程' },
  { key: 'coach', label: '教练' },
  { key: 'time', label: '时间' },
  { key: 'capacity', label: '预约/容量' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() =>
  attendance.value
    .map((item) => {
      const schedule = schedules.value.find((row) => row.id === item.scheduleId);
      return {
        ...item,
        person: item.role === 'student' ? studentName(item.studentId) : coachName(item.coachId),
        roleText: item.role === 'student' ? '学员' : '教练',
        course: schedule ? productName(schedule.productId) : '未知课程',
        classTime: schedule ? formatDateTime(schedule.startTime) : '-',
        checkedAt: item.checkedAt ? formatDateTime(item.checkedAt) : '-',
      };
    })
    .filter((row) => roleFilter.value === 'all' || row.role === roleFilter.value)
    .filter((row) => [row.person, row.course, row.classTime].some((value) => includesText(value, keyword.value))),
);

const pendingSchedules = computed(() =>
  schedules.value
    .filter((schedule) => sameDate(schedule.startTime, new Date()) && schedule.status === 'scheduled')
    .map((schedule) => ({
      id: schedule.id,
      course: productName(schedule.productId),
      coach: coachName(schedule.coachId),
      time: formatDateTime(schedule.startTime),
      capacity: `${schedule.bookedCount}/${schedule.capacity}`,
      status: schedule.status,
    })),
);

const stats = computed(() => {
  const done = attendance.value.filter((item) => item.status === 'present').length;
  const absent = attendance.value.filter((item) => item.status === 'absent').length;
  const leave = attendance.value.filter((item) => item.status === 'leave').length;
  const total = attendance.value.length || 1;
  return {
    done,
    absent,
    leave,
    rate: percent(done / total),
  };
});

const load = async () => {
  loading.value = true;
  try {
    const resp = await adminApi.getAttendance();
    attendance.value = resp.data.attendance;
    schedules.value = resp.data.schedules;
    students.value = resp.data.students;
    coaches.value = resp.data.coaches;
    products.value = resp.data.products;
  } finally {
    loading.value = false;
  }
};

const studentName = (id?: string) => students.value.find((item) => item.id === id)?.name || '未知学员';
const coachName = (id?: string) => coaches.value.find((item) => item.id === id)?.name || '未知教练';
const productName = (id: string) => products.value.find((item) => item.id === id)?.name || '未知课程';

const mark = async (row: Attendance, status: 'present' | 'absent' | 'leave') => {
  await adminApi.markAttendance(row.id, status);
  await load();
};

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">考勤管理</h1>
        <p class="page-description">查看今日待签到课程，管理学员和教练签到记录。</p>
      </div>
    </header>

    <div class="stat-grid">
      <StatCard label="已签到" :value="stats.done" tone="green" />
      <StatCard label="旷课" :value="stats.absent" tone="orange" />
      <StatCard label="请假" :value="stats.leave" tone="blue" />
      <StatCard label="出勤率" :value="stats.rate" tone="teal" />
    </div>

    <BaseCard title="今日待签到课程">
      <DataTable :columns="pendingColumns" :rows="pendingSchedules">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
      </DataTable>
    </BaseCard>

    <BaseCard title="签到记录">
      <DataToolbar v-model:keyword="keyword" placeholder="搜索人员、课程">
        <template #filters>
          <div class="tabs">
            <button class="tab-button" :class="{ active: roleFilter === 'all' }" @click="roleFilter = 'all'">全部</button>
            <button class="tab-button" :class="{ active: roleFilter === 'student' }" @click="roleFilter = 'student'">学员</button>
            <button class="tab-button" :class="{ active: roleFilter === 'coach' }" @click="roleFilter = 'coach'">教练</button>
          </div>
        </template>
        <template #actions>
          <BaseButton :loading="loading" @click="load">
            <template #icon><RefreshCw /></template>
            刷新
          </BaseButton>
        </template>
      </DataToolbar>
      <DataTable :columns="recordColumns" :rows="rows">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" @click="mark(row, 'present')">
              <template #icon><Check /></template>
              到课
            </BaseButton>
            <BaseButton size="sm" variant="warning" @click="mark(row, 'leave')">
              <template #icon><Umbrella /></template>
              请假
            </BaseButton>
            <BaseButton size="sm" variant="danger" @click="mark(row, 'absent')">
              <template #icon><X /></template>
              旷课
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
