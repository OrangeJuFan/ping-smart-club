<script setup lang="ts">
import { CalendarDays, Pencil, Plus, RefreshCw, ToggleLeft, ToggleRight } from '@lucide/vue';
import { computed, onMounted, reactive, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import CalendarSchedule, { type CalendarEvent } from '@/components/CalendarSchedule.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { Coach, CourseProduct, Schedule, Venue } from '@/types/domain';
import { pickText } from '@/utils/format';

const venues = ref<Venue[]>([]);
const schedules = ref<Schedule[]>([]);
const products = ref<CourseProduct[]>([]);
const coaches = ref<Coach[]>([]);
const keyword = ref('');
const loading = ref(false);
const saving = ref(false);
const formOpen = ref(false);
const scheduleOpen = ref(false);
const selected = ref<Venue | null>(null);

const emptyVenue = (): Omit<Venue, 'id'> & Partial<Pick<Venue, 'id'>> => ({
  name: '',
  area: 'A 区',
  capacity: 6,
  status: 'active',
  remark: '',
});

const form = reactive(emptyVenue());

const columns: TableColumn[] = [
  { key: 'name', label: '场地' },
  { key: 'area', label: '区域' },
  { key: 'capacity', label: '容量', align: 'right' },
  { key: 'remark', label: '备注' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() => venues.value.filter((venue) => pickText(venue, ['name', 'area', 'remark'], keyword.value)));

const calendarEvents = computed<CalendarEvent[]>(() => {
  if (!selected.value) return [];
  return schedules.value
    .filter((schedule) => schedule.venueId === selected.value?.id)
    .map((schedule) => ({
      id: schedule.id,
      title: products.value.find((item) => item.id === schedule.productId)?.name || '未知课程',
      subtitle: `${coaches.value.find((item) => item.id === schedule.coachId)?.name || '未分配教练'} · ${schedule.bookedCount}/${schedule.capacity}`,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      status: schedule.status,
    }));
});

const load = async () => {
  loading.value = true;
  try {
    const [venueResp, scheduleResp] = await Promise.all([adminApi.getVenues(), adminApi.getSchedules()]);
    venues.value = venueResp.data;
    schedules.value = scheduleResp.data.schedules;
    products.value = scheduleResp.data.products;
    coaches.value = scheduleResp.data.coaches;
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  selected.value = null;
  Object.assign(form, emptyVenue());
  formOpen.value = true;
};

const openEdit = (venue: Venue) => {
  selected.value = venue;
  Object.assign(form, structuredClone(venue));
  formOpen.value = true;
};

const openSchedule = (venue: Venue) => {
  selected.value = venue;
  scheduleOpen.value = true;
};

const save = async () => {
  if (!form.name.trim()) return;
  saving.value = true;
  try {
    await adminApi.saveVenue(structuredClone(form));
    formOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (venue: Venue) => {
  await adminApi.saveVenue({ ...venue, status: venue.status === 'active' ? 'inactive' : 'active' });
  await load();
};

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">场地管理</h1>
        <p class="page-description">维护场地启用状态、容量与场地日程。</p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <template #icon><Plus /></template>
        新增场地
      </BaseButton>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索场地、区域">
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
            <BaseButton size="sm" @click="openSchedule(row)">
              <template #icon><CalendarDays /></template>
              日程
            </BaseButton>
            <BaseButton size="sm" @click="toggleStatus(row)">
              <template #icon>
                <ToggleRight v-if="row.status === 'active'" />
                <ToggleLeft v-else />
              </template>
              {{ row.status === 'active' ? '停用' : '启用' }}
            </BaseButton>
            <BaseButton size="sm" @click="openEdit(row)">
              <template #icon><Pencil /></template>
              编辑
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <DetailDrawer v-model="formOpen" :title="form.id ? '编辑场地' : '新增场地'">
      <div class="grid grid-2">
        <label class="field">
          <span>场地名称</span>
          <input v-model.trim="form.name" class="input" />
        </label>
        <label class="field">
          <span>区域</span>
          <input v-model.trim="form.area" class="input" />
        </label>
        <label class="field">
          <span>容量</span>
          <input v-model.number="form.capacity" class="input" min="1" type="number" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="form.status" class="select">
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
        </label>
      </div>
      <label class="field">
        <span>备注</span>
        <textarea v-model.trim="form.remark" class="textarea" />
      </label>
      <template #footer>
        <BaseButton @click="formOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">保存</BaseButton>
      </template>
    </DetailDrawer>

    <DetailDrawer v-model="scheduleOpen" :title="selected ? `${selected.name}日程` : '场地日程'" width="760px">
      <CalendarSchedule :events="calendarEvents" mode="week" />
    </DetailDrawer>
  </div>
</template>
