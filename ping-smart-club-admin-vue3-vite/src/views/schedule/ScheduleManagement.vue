<script setup lang="ts">
import { CalendarX, Eye, Pencil, Plus, RefreshCw, Repeat2 } from '@lucide/vue';
import { computed, onMounted, reactive, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import CalendarSchedule, { type CalendarEvent } from '@/components/CalendarSchedule.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { Booking, Coach, CourseProduct, Schedule, Student, Venue } from '@/types/domain';
import { formatDateTime } from '@/utils/date';
import { includesText } from '@/utils/format';

const schedules = ref<Schedule[]>([]);
const bookings = ref<Booking[]>([]);
const students = ref<Student[]>([]);
const coaches = ref<Coach[]>([]);
const products = ref<CourseProduct[]>([]);
const venues = ref<Venue[]>([]);
const keyword = ref('');
const viewMode = ref<'table' | 'week' | 'day'>('week');
const loading = ref(false);
const saving = ref(false);
const formOpen = ref(false);
const bookingOpen = ref(false);
const swapOpen = ref(false);
const selected = ref<Schedule | null>(null);
const swapCoachId = ref('');

const emptySchedule = (): Omit<Schedule, 'id' | 'bookedCount' | 'waitlistCount'> & Partial<Schedule> => ({
  productId: '',
  coachId: '',
  venueId: '',
  startTime: '',
  endTime: '',
  capacity: 8,
  status: 'scheduled',
});

const form = reactive(emptySchedule());

const columns: TableColumn[] = [
  { key: 'course', label: '课程' },
  { key: 'time', label: '上课时间' },
  { key: 'coach', label: '教练' },
  { key: 'venue', label: '场地' },
  { key: 'capacityText', label: '预约/容量' },
  { key: 'waitlistCount', label: '候补', align: 'right' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() =>
  schedules.value
    .map((schedule) => ({
      ...schedule,
      course: productName(schedule.productId),
      coach: coachName(schedule.coachId),
      venue: venueName(schedule.venueId),
      time: `${formatDateTime(schedule.startTime)} - ${formatDateTime(schedule.endTime).slice(11)}`,
      capacityText: `${schedule.bookedCount}/${schedule.capacity}`,
    }))
    .filter((row) =>
      [row.course, row.coach, row.venue, row.time, row.status].some((value) => includesText(value, keyword.value)),
    ),
);

const calendarEvents = computed<CalendarEvent[]>(() =>
  rows.value.map((row) => ({
    id: row.id,
    title: row.course,
    subtitle: `${row.coach} · ${row.venue} · ${row.capacityText}`,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status,
  })),
);

const selectedBookings = computed(() => {
  if (!selected.value) return [];
  return bookings.value
    .filter((booking) => booking.scheduleId === selected.value?.id)
    .map((booking) => ({
      id: booking.id,
      student: students.value.find((student) => student.id === booking.studentId)?.name || '未知学员',
      phone: students.value.find((student) => student.id === booking.studentId)?.phone || '-',
      status: booking.status,
      createdAt: formatDateTime(booking.createdAt),
      cancelReason: booking.cancelReason || '-',
    }));
});

const load = async () => {
  loading.value = true;
  try {
    const resp = await adminApi.getSchedules();
    schedules.value = resp.data.schedules;
    bookings.value = resp.data.bookings;
    students.value = resp.data.students;
    coaches.value = resp.data.coaches;
    products.value = resp.data.products;
    venues.value = resp.data.venues;
  } finally {
    loading.value = false;
  }
};

const productName = (id: string) => products.value.find((item) => item.id === id)?.name || '未知课程';
const coachName = (id: string) => coaches.value.find((item) => item.id === id)?.name || '未分配教练';
const venueName = (id: string) => venues.value.find((item) => item.id === id)?.name || '未分配场地';
const normalizeDateTime = (value: string) => (value.length === 16 ? `${value}:00` : value);

const resetForm = () => {
  Object.assign(form, emptySchedule(), {
    productId: products.value[0]?.id || '',
    coachId: coaches.value[0]?.id || '',
    venueId: venues.value[0]?.id || '',
  });
};

const openCreate = () => {
  selected.value = null;
  resetForm();
  formOpen.value = true;
};

const openEdit = (schedule: Schedule) => {
  selected.value = schedule;
  resetForm();
  Object.assign(form, structuredClone(schedule), {
    startTime: schedule.startTime.slice(0, 16),
    endTime: schedule.endTime.slice(0, 16),
  });
  formOpen.value = true;
};

const openBookings = (schedule: Schedule) => {
  selected.value = schedule;
  bookingOpen.value = true;
};

const openSwap = (schedule: Schedule) => {
  selected.value = schedule;
  swapCoachId.value = schedule.coachId;
  swapOpen.value = true;
};

const save = async () => {
  if (!form.productId || !form.coachId || !form.venueId || !form.startTime || !form.endTime) return;
  saving.value = true;
  try {
    await adminApi.saveSchedule({
      ...structuredClone(form),
      startTime: normalizeDateTime(form.startTime),
      endTime: normalizeDateTime(form.endTime),
    });
    formOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
};

const cancelSchedule = async (schedule: Schedule) => {
  if (!window.confirm(`确认取消 ${productName(schedule.productId)} 吗？`)) return;
  await adminApi.cancelSchedule(schedule.id);
  await load();
};

const swapCoach = async () => {
  if (!selected.value || !swapCoachId.value) return;
  saving.value = true;
  try {
    await adminApi.swapCoach(selected.value.id, swapCoachId.value);
    swapOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
};

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">排课管理</h1>
        <p class="page-description">创建课程安排，编辑时间、教练、场地、容量，并处理取消和调课。</p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <template #icon><Plus /></template>
        创建课程安排
      </BaseButton>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索课程、教练、场地">
        <template #filters>
          <div class="tabs">
            <button class="tab-button" :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">周课表</button>
            <button class="tab-button" :class="{ active: viewMode === 'day' }" @click="viewMode = 'day'">日课表</button>
            <button class="tab-button" :class="{ active: viewMode === 'table' }" @click="viewMode = 'table'">表格</button>
          </div>
        </template>
        <template #actions>
          <BaseButton :loading="loading" @click="load">
            <template #icon><RefreshCw /></template>
            刷新
          </BaseButton>
        </template>
      </DataToolbar>

      <CalendarSchedule v-if="viewMode !== 'table'" :events="calendarEvents" :mode="viewMode" />
      <DataTable v-else :columns="columns" :rows="rows">
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" @click="openBookings(row)">
              <template #icon><Eye /></template>
              名单
            </BaseButton>
            <BaseButton size="sm" @click="openSwap(row)">
              <template #icon><Repeat2 /></template>
              调教练
            </BaseButton>
            <BaseButton size="sm" @click="openEdit(row)">
              <template #icon><Pencil /></template>
              编辑
            </BaseButton>
            <BaseButton size="sm" variant="danger" @click="cancelSchedule(row)">
              <template #icon><CalendarX /></template>
              取消
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <DetailDrawer v-model="formOpen" :title="form.id ? '编辑课程安排' : '创建课程安排'">
      <div class="grid grid-2">
        <label class="field">
          <span>课程产品</span>
          <select v-model="form.productId" class="select">
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>教练</span>
          <select v-model="form.coachId" class="select">
            <option v-for="coach in coaches" :key="coach.id" :value="coach.id">{{ coach.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>场地</span>
          <select v-model="form.venueId" class="select">
            <option v-for="venue in venues" :key="venue.id" :value="venue.id">{{ venue.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>容量</span>
          <input v-model.number="form.capacity" class="input" min="1" type="number" />
        </label>
        <label class="field">
          <span>开始时间</span>
          <input v-model="form.startTime" class="input" type="datetime-local" />
        </label>
        <label class="field">
          <span>结束时间</span>
          <input v-model="form.endTime" class="input" type="datetime-local" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="form.status" class="select">
            <option value="scheduled">待上课</option>
            <option value="teaching">上课中</option>
            <option value="finished">已完成</option>
            <option value="canceled">已取消</option>
          </select>
        </label>
      </div>
      <template #footer>
        <BaseButton @click="formOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">保存</BaseButton>
      </template>
    </DetailDrawer>

    <DetailDrawer v-model="bookingOpen" title="预约名单" width="720px">
      <BaseCard v-if="selected" :title="productName(selected.productId)" :subtitle="formatDateTime(selected.startTime)">
        <DataTable
          :columns="[
            { key: 'student', label: '学员' },
            { key: 'phone', label: '手机号' },
            { key: 'createdAt', label: '预约时间' },
            { key: 'status', label: '状态' },
            { key: 'cancelReason', label: '取消原因' },
          ]"
          :rows="selectedBookings"
        >
          <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        </DataTable>
      </BaseCard>
    </DetailDrawer>

    <DetailDrawer v-model="swapOpen" title="调换教练" width="420px">
      <label class="field">
        <span>新教练</span>
        <select v-model="swapCoachId" class="select">
          <option v-for="coach in coaches" :key="coach.id" :value="coach.id">{{ coach.name }} · {{ coach.title }}</option>
        </select>
      </label>
      <template #footer>
        <BaseButton @click="swapOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="swapCoach">确认调换</BaseButton>
      </template>
    </DetailDrawer>
  </div>
</template>
