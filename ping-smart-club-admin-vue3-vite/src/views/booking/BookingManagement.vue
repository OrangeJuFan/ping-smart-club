<script setup lang="ts">
import { CheckCircle2, RefreshCw, RotateCcw, XCircle } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { Booking, Coach, CourseProduct, Schedule, Student } from '@/types/domain';
import { formatDate, formatDateTime } from '@/utils/date';
import { includesText } from '@/utils/format';

const bookings = ref<Booking[]>([]);
const schedules = ref<Schedule[]>([]);
const students = ref<Student[]>([]);
const products = ref<CourseProduct[]>([]);
const coaches = ref<Coach[]>([]);
const keyword = ref('');
const statusFilter = ref('');
const dateFilter = ref('');
const loading = ref(false);

const columns: TableColumn[] = [
  { key: 'student', label: '学员' },
  { key: 'course', label: '课程' },
  { key: 'coach', label: '教练' },
  { key: 'classTime', label: '上课时间' },
  { key: 'createdAt', label: '预约时间' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() =>
  bookings.value
    .map((booking) => {
      const schedule = schedules.value.find((item) => item.id === booking.scheduleId);
      return {
        ...booking,
        student: studentName(booking.studentId),
        course: schedule ? productName(schedule.productId) : '未知课程',
        coach: schedule ? coachName(schedule.coachId) : '未分配教练',
        classTime: schedule ? formatDateTime(schedule.startTime) : '-',
        classDate: schedule ? formatDate(schedule.startTime) : '',
        createdAt: formatDateTime(booking.createdAt),
      };
    })
    .filter((row) => !statusFilter.value || row.status === statusFilter.value)
    .filter((row) => !dateFilter.value || row.classDate === dateFilter.value)
    .filter((row) => [row.student, row.course, row.coach, row.classTime].some((value) => includesText(value, keyword.value))),
);

const waitlistRows = computed(() => rows.value.filter((row) => row.status === 'waitlisted'));

const load = async () => {
  loading.value = true;
  try {
    const resp = await adminApi.getBookings();
    bookings.value = resp.data.bookings;
    schedules.value = resp.data.schedules;
    students.value = resp.data.students;
    products.value = resp.data.products;
    coaches.value = resp.data.coaches;
  } finally {
    loading.value = false;
  }
};

const studentName = (id: string) => students.value.find((item) => item.id === id)?.name || '未知学员';
const productName = (id: string) => products.value.find((item) => item.id === id)?.name || '未知课程';
const coachName = (id: string) => coaches.value.find((item) => item.id === id)?.name || '未分配教练';

const cancelBooking = async (booking: Booking) => {
  const reason = window.prompt('请输入后台取消原因', '后台取消预约') || '后台取消预约';
  await adminApi.updateBookingStatus(booking.id, 'canceled', reason);
  await load();
};

const consumeBooking = async (booking: Booking) => {
  if (!window.confirm('确认后台代消课？')) return;
  await adminApi.updateBookingStatus(booking.id, 'consumed');
  await load();
};

const promote = async (booking: Booking) => {
  await adminApi.promoteWaitlist(booking.id);
  await load();
};

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">预约管理</h1>
        <p class="page-description">查看所有预约记录，按学员、课程、教练、时间和状态筛选，并处理取消、消课与候补。</p>
      </div>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索学员、课程、教练">
        <template #filters>
          <select v-model="statusFilter" class="select">
            <option value="">全部状态</option>
            <option value="booked">已预约</option>
            <option value="waitlisted">候补中</option>
            <option value="canceled">已取消</option>
            <option value="consumed">已消课</option>
          </select>
          <input v-model="dateFilter" class="input date-input" type="date" />
        </template>
        <template #actions>
          <BaseButton :loading="loading" @click="load">
            <template #icon><RefreshCw /></template>
            刷新
          </BaseButton>
        </template>
      </DataToolbar>

      <DataTable :columns="columns" :rows="rows">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton v-if="row.status === 'waitlisted'" size="sm" variant="warning" @click="promote(row)">
              <template #icon><RotateCcw /></template>
              转正
            </BaseButton>
            <BaseButton v-if="row.status === 'booked'" size="sm" @click="consumeBooking(row)">
              <template #icon><CheckCircle2 /></template>
              代消课
            </BaseButton>
            <BaseButton
              v-if="row.status === 'booked' || row.status === 'waitlisted'"
              size="sm"
              variant="danger"
              @click="cancelBooking(row)"
            >
              <template #icon><XCircle /></template>
              取消
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <BaseCard title="候补队列" subtitle="第一阶段支持人工转正，后续可接自动候补规则。">
      <DataTable
        :columns="[
          { key: 'student', label: '学员' },
          { key: 'course', label: '课程' },
          { key: 'coach', label: '教练' },
          { key: 'classTime', label: '上课时间' },
          { key: 'createdAt', label: '进入候补时间' },
        ]"
        :rows="waitlistRows"
      >
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" variant="primary" @click="promote(row)">
              <template #icon><RotateCcw /></template>
              手动转正
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>
  </div>
</template>

<style scoped>
.date-input {
  width: 160px;
}
</style>
