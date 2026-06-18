<script setup lang="ts">
import { CalendarClock, Eye, Pencil, Plus, RefreshCw } from '@lucide/vue';
import { computed, onMounted, reactive, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import CalendarSchedule, { type CalendarEvent } from '@/components/CalendarSchedule.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { Coach, CourseProduct, CourseType, Schedule, Venue } from '@/types/domain';
import { formatDateTime } from '@/utils/date';
import { pickText } from '@/utils/format';

const coaches = ref<Coach[]>([]);
const courseTypes = ref<CourseType[]>([]);
const products = ref<CourseProduct[]>([]);
const schedules = ref<Schedule[]>([]);
const venues = ref<Venue[]>([]);
const keyword = ref('');
const statusFilter = ref('');
const loading = ref(false);
const saving = ref(false);
const formOpen = ref(false);
const detailOpen = ref(false);
const selected = ref<Coach | null>(null);
const certificationsText = ref('');
const availableTimesText = ref('');
const leaveDatesText = ref('');

const emptyCoach = (): Omit<Coach, 'id'> & Partial<Pick<Coach, 'id'>> => ({
  name: '',
  phone: '',
  title: '教练',
  courseTypes: [],
  certifications: [],
  availableTimes: [],
  leaveDates: [],
  status: 'active',
});

const form = reactive(emptyCoach());

const columns: TableColumn[] = [
  { key: 'name', label: '教练' },
  { key: 'title', label: '职级' },
  { key: 'courseTypeText', label: '可授课程' },
  { key: 'phone', label: '联系电话' },
  { key: 'leaveText', label: '请假' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() =>
  coaches.value
    .filter((coach) => !statusFilter.value || coach.status === statusFilter.value)
    .filter((coach) => pickText(coach, ['name', 'phone', 'title'], keyword.value) || coach.courseTypes.some((item) => item.includes(keyword.value)))
    .map((coach) => ({
      ...coach,
      courseTypeText: coach.courseTypes.join('、') || '-',
      leaveText: coach.leaveDates.length ? coach.leaveDates.join('、') : '无',
    })),
);

const selectedScheduleRows = computed(() => {
  if (!selected.value) return [];
  return schedules.value
    .filter((schedule) => schedule.coachId === selected.value?.id)
    .map((schedule) => ({
      id: schedule.id,
      course: products.value.find((item) => item.id === schedule.productId)?.name || '未知课程',
      venue: venues.value.find((item) => item.id === schedule.venueId)?.name || '未知场地',
      time: formatDateTime(schedule.startTime),
      capacity: `${schedule.bookedCount}/${schedule.capacity}`,
      status: schedule.status,
    }));
});

const selectedCalendarEvents = computed<CalendarEvent[]>(() =>
  selectedScheduleRows.value.map((row) => ({
    id: row.id,
    title: row.course,
    subtitle: `${row.venue} · ${row.capacity}`,
    startTime: schedules.value.find((schedule) => schedule.id === row.id)?.startTime || '',
    endTime: schedules.value.find((schedule) => schedule.id === row.id)?.endTime || '',
    status: row.status,
  })),
);

const load = async () => {
  loading.value = true;
  try {
    const [coachResp, courseResp, scheduleResp] = await Promise.all([
      adminApi.getCoaches(),
      adminApi.getCourses(),
      adminApi.getSchedules(),
    ]);
    coaches.value = coachResp.data;
    courseTypes.value = courseResp.data.types;
    products.value = scheduleResp.data.products;
    schedules.value = scheduleResp.data.schedules;
    venues.value = scheduleResp.data.venues;
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, emptyCoach());
  certificationsText.value = '';
  availableTimesText.value = '';
  leaveDatesText.value = '';
};

const syncTextToForm = () => {
  form.certifications = certificationsText.value.split('\n').map((item) => item.trim()).filter(Boolean);
  form.availableTimes = availableTimesText.value.split('\n').map((item) => item.trim()).filter(Boolean);
  form.leaveDates = leaveDatesText.value.split('\n').map((item) => item.trim()).filter(Boolean);
};

const openCreate = () => {
  selected.value = null;
  resetForm();
  formOpen.value = true;
};

const openEdit = (coach: Coach) => {
  selected.value = coach;
  resetForm();
  Object.assign(form, structuredClone(coach));
  certificationsText.value = coach.certifications.join('\n');
  availableTimesText.value = coach.availableTimes.join('\n');
  leaveDatesText.value = coach.leaveDates.join('\n');
  formOpen.value = true;
};

const openDetail = (coach: Coach) => {
  selected.value = coach;
  detailOpen.value = true;
};

const save = async () => {
  syncTextToForm();
  if (!form.name.trim() || !form.phone.trim()) return;
  saving.value = true;
  try {
    await adminApi.saveCoach(structuredClone(form));
    formOpen.value = false;
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
        <h1 class="page-title">教练管理</h1>
        <p class="page-description">维护教练资料、资质、可授课时间、请假与课表。</p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <template #icon><Plus /></template>
        新增教练
      </BaseButton>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索教练、课程类型、手机号">
        <template #filters>
          <select v-model="statusFilter" class="select">
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
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
            <BaseButton size="sm" @click="openDetail(row)">
              <template #icon><Eye /></template>
              课表
            </BaseButton>
            <BaseButton size="sm" @click="openEdit(row)">
              <template #icon><Pencil /></template>
              编辑
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <DetailDrawer v-model="formOpen" :title="form.id ? '编辑教练' : '新增教练'">
      <div class="grid grid-2">
        <label class="field">
          <span>教练姓名</span>
          <input v-model.trim="form.name" class="input" />
        </label>
        <label class="field">
          <span>手机号</span>
          <input v-model.trim="form.phone" class="input" />
        </label>
        <label class="field">
          <span>职级</span>
          <input v-model.trim="form.title" class="input" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="form.status" class="select">
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
        </label>
      </div>

      <BaseCard title="可授课程类型">
        <div class="check-grid">
          <label v-for="type in courseTypes" :key="type.id">
            <input v-model="form.courseTypes" :value="type.name" type="checkbox" />
            {{ type.name }}
          </label>
        </div>
      </BaseCard>

      <div class="grid grid-2">
        <label class="field">
          <span>资质证书（每行一条）</span>
          <textarea v-model="certificationsText" class="textarea" />
        </label>
        <label class="field">
          <span>可授课时间（每行一条）</span>
          <textarea v-model="availableTimesText" class="textarea" placeholder="周一 16:00-20:00" />
        </label>
      </div>
      <label class="field">
        <span>请假日期（每行一个 YYYY-MM-DD）</span>
        <textarea v-model="leaveDatesText" class="textarea" />
      </label>

      <template #footer>
        <BaseButton @click="formOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">保存</BaseButton>
      </template>
    </DetailDrawer>

    <DetailDrawer v-model="detailOpen" title="教练课表" width="760px">
      <div v-if="selected" class="detail-stack">
        <BaseCard :title="selected.name" :subtitle="`${selected.title} · ${selected.phone}`">
          <p>可授课程：{{ selected.courseTypes.join('、') || '-' }}</p>
          <p>请假日期：{{ selected.leaveDates.join('、') || '无' }}</p>
        </BaseCard>
        <BaseCard title="日历课表">
          <CalendarSchedule :events="selectedCalendarEvents" mode="week" />
        </BaseCard>
        <BaseCard title="课表明细">
          <DataTable
            :columns="[
              { key: 'course', label: '课程' },
              { key: 'venue', label: '场地' },
              { key: 'time', label: '时间' },
              { key: 'capacity', label: '预约/容量' },
              { key: 'status', label: '状态' },
            ]"
            :rows="selectedScheduleRows"
          >
            <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
          </DataTable>
        </BaseCard>
      </div>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.check-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
}

.check-grid label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
  font-size: 14px;
}

.detail-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-stack p {
  margin: 0 0 6px;
  color: var(--color-text-muted);
}
</style>
