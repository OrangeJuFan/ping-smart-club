<script setup lang="ts">
import { Eye, Pencil, Plus, RefreshCw, WalletCards } from '@lucide/vue';
import { computed, onMounted, reactive, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { appConfig } from '@/config/app';
import type { Attendance, Booking, CourseProduct, Schedule, Student } from '@/types/domain';
import { formatDateTime } from '@/utils/date';
import { pickText } from '@/utils/format';

const students = ref<Student[]>([]);
const bookings = ref<Booking[]>([]);
const attendance = ref<Attendance[]>([]);
const schedules = ref<Schedule[]>([]);
const products = ref<CourseProduct[]>([]);
const keyword = ref('');
const statusFilter = ref('');
const loading = ref(false);
const saving = ref(false);
const notice = ref('');
const formOpen = ref(false);
const detailOpen = ref(false);
const balanceOpen = ref(false);
const selected = ref<Student | null>(null);
const balanceDelta = ref(10);
const balanceRemark = ref('课时充值');

const emptyStudent = (): Omit<Student, 'id' | 'createdAt'> & Partial<Pick<Student, 'id' | 'createdAt'>> => ({
  name: '',
  phone: '',
  age: 8,
  level: '启蒙班',
  balance: 0,
  guardian: { name: '', relation: '妈妈', phone: '', wechat: '' },
  status: 'active',
  remark: '',
});

const form = reactive(emptyStudent());

const columns: TableColumn[] = [
  { key: 'name', label: '学员' },
  { key: 'level', label: '阶段' },
  { key: 'guardianName', label: '家长' },
  { key: 'phone', label: '联系电话' },
  { key: 'balance', label: '课时余额', align: 'right' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() =>
  students.value
    .filter((student) => !statusFilter.value || student.status === statusFilter.value)
    .filter((student) => pickText(student, ['name', 'phone', 'level'], keyword.value) || pickText(student.guardian, ['name', 'phone'], keyword.value))
    .map((student) => ({
      ...student,
      guardianName: `${student.guardian.name}（${student.guardian.relation}）`,
    })),
);

const selectedBookingRows = computed(() => {
  if (!selected.value) return [];
  return bookings.value
    .filter((booking) => booking.studentId === selected.value?.id)
    .map((booking) => {
      const schedule = schedules.value.find((item) => item.id === booking.scheduleId);
      const product = products.value.find((item) => item.id === schedule?.productId);
      return {
        id: booking.id,
        course: product?.name || '未知课程',
        time: schedule ? formatDateTime(schedule.startTime) : '-',
        status: booking.status,
      };
    });
});

const selectedAttendanceRows = computed(() => {
  if (!selected.value) return [];
  return attendance.value
    .filter((item) => item.studentId === selected.value?.id)
    .map((item) => {
      const schedule = schedules.value.find((row) => row.id === item.scheduleId);
      const product = products.value.find((row) => row.id === schedule?.productId);
      return {
        id: item.id,
        course: product?.name || '未知课程',
        time: schedule ? formatDateTime(schedule.startTime) : '-',
        status: item.status,
      };
    });
});

const load = async () => {
  loading.value = true;
  try {
    const [studentResp, scheduleResp, attendanceResp] = await Promise.all([
      adminApi.getStudents(),
      adminApi.getSchedules(),
      adminApi.getAttendance(),
    ]);
    students.value = studentResp.data;
    bookings.value = scheduleResp.data.bookings;
    schedules.value = scheduleResp.data.schedules;
    products.value = scheduleResp.data.products;
    attendance.value = attendanceResp.data.attendance;
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, emptyStudent());
};

const openCreate = () => {
  selected.value = null;
  resetForm();
  formOpen.value = true;
};

const openEdit = (student: Student) => {
  selected.value = student;
  resetForm();
  Object.assign(form, structuredClone(student));
  formOpen.value = true;
};

const openDetail = (student: Student) => {
  selected.value = student;
  detailOpen.value = true;
};

const openBalance = (student: Student) => {
  selected.value = student;
  balanceDelta.value = 10;
  balanceRemark.value = '课时充值';
  balanceOpen.value = true;
};

const save = async () => {
  if (!form.name.trim() || !form.phone.trim() || !form.guardian.name.trim()) {
    notice.value = '请完善学员姓名、手机号和家长姓名';
    return;
  }

  saving.value = true;
  try {
    await adminApi.saveStudent(structuredClone(form));
    formOpen.value = false;
    notice.value = '学员信息已保存';
    await load();
  } finally {
    saving.value = false;
  }
};

const adjustBalance = async () => {
  if (!selected.value) return;
  saving.value = true;
  try {
    await adminApi.adjustStudentBalance(selected.value.id, Number(balanceDelta.value), balanceRemark.value);
    balanceOpen.value = false;
    notice.value = '课时余额已调整';
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
        <h1 class="page-title">学员管理</h1>
        <p class="page-description">维护学员、家长、课时余额、预约记录和考勤记录。</p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <template #icon><Plus /></template>
        新增学员
      </BaseButton>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索学员、手机号、家长">
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
      <p v-if="notice" class="notice">{{ notice }}</p>
      <DataTable :columns="columns" :rows="rows">
        <template #cell-balance="{ value }">
          <strong :class="{ low: Number(value) < appConfig.lowBalanceThreshold }">{{ value }}</strong>
        </template>
        <template #cell-status="{ value }">
          <StatusBadge :status="String(value)" />
        </template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" @click="openDetail(row)">
              <template #icon><Eye /></template>
              详情
            </BaseButton>
            <BaseButton size="sm" @click="openBalance(row)">
              <template #icon><WalletCards /></template>
              课时
            </BaseButton>
            <BaseButton size="sm" @click="openEdit(row)">
              <template #icon><Pencil /></template>
              编辑
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <DetailDrawer v-model="formOpen" :title="form.id ? '编辑学员' : '新增学员'">
      <div class="grid grid-2">
        <label class="field">
          <span>学员姓名</span>
          <input v-model.trim="form.name" class="input" />
        </label>
        <label class="field">
          <span>学员手机号</span>
          <input v-model.trim="form.phone" class="input" />
        </label>
        <label class="field">
          <span>年龄</span>
          <input v-model.number="form.age" class="input" min="3" type="number" />
        </label>
        <label class="field">
          <span>训练阶段</span>
          <input v-model.trim="form.level" class="input" />
        </label>
        <label class="field">
          <span>课时余额</span>
          <input v-model.number="form.balance" class="input" min="0" type="number" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="form.status" class="select">
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
        </label>
        <label class="field">
          <span>家长姓名</span>
          <input v-model.trim="form.guardian.name" class="input" />
        </label>
        <label class="field">
          <span>关系</span>
          <input v-model.trim="form.guardian.relation" class="input" />
        </label>
        <label class="field">
          <span>家长电话</span>
          <input v-model.trim="form.guardian.phone" class="input" />
        </label>
        <label class="field">
          <span>微信</span>
          <input v-model.trim="form.guardian.wechat" class="input" />
        </label>
      </div>
      <label class="field remark-field">
        <span>备注</span>
        <textarea v-model.trim="form.remark" class="textarea" />
      </label>
      <template #footer>
        <BaseButton @click="formOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">保存</BaseButton>
      </template>
    </DetailDrawer>

    <DetailDrawer v-model="detailOpen" title="学员详情" width="680px">
      <div v-if="selected" class="detail-block">
        <h3>{{ selected.name }}</h3>
        <p>{{ selected.level }} · {{ selected.phone }} · 余额 {{ selected.balance }} 课时</p>
        <div class="grid grid-2">
          <BaseCard title="家长信息">
            <p>{{ selected.guardian.name }}（{{ selected.guardian.relation }}）</p>
            <p>{{ selected.guardian.phone }} · {{ selected.guardian.wechat || '未填写微信' }}</p>
          </BaseCard>
          <BaseCard title="备注">
            <p>{{ selected.remark || '暂无备注' }}</p>
          </BaseCard>
        </div>
        <BaseCard title="预约记录">
          <DataTable
            :columns="[
              { key: 'course', label: '课程' },
              { key: 'time', label: '时间' },
              { key: 'status', label: '状态' },
            ]"
            :rows="selectedBookingRows"
          >
            <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
          </DataTable>
        </BaseCard>
        <BaseCard title="考勤记录">
          <DataTable
            :columns="[
              { key: 'course', label: '课程' },
              { key: 'time', label: '时间' },
              { key: 'status', label: '状态' },
            ]"
            :rows="selectedAttendanceRows"
          >
            <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
          </DataTable>
        </BaseCard>
      </div>
    </DetailDrawer>

    <DetailDrawer v-model="balanceOpen" title="课时充值 / 调整" width="420px">
      <div v-if="selected" class="balance-box">
        <p>当前学员：<strong>{{ selected.name }}</strong></p>
        <p>当前余额：<strong>{{ selected.balance }}</strong> 课时</p>
        <label class="field">
          <span>调整课时</span>
          <input v-model.number="balanceDelta" class="input" type="number" />
        </label>
        <label class="field">
          <span>调整原因</span>
          <input v-model.trim="balanceRemark" class="input" />
        </label>
      </div>
      <template #footer>
        <BaseButton @click="balanceOpen = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="adjustBalance">确认调整</BaseButton>
      </template>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.notice {
  margin: 0 0 12px;
  color: var(--color-primary);
  font-size: 13px;
}

.low {
  color: var(--color-danger);
}

.remark-field {
  margin-top: 14px;
}

.detail-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-block h3 {
  margin: 0;
  font-size: 20px;
}

.detail-block p,
.balance-box p {
  margin: 0 0 8px;
  color: var(--color-text-muted);
}

.balance-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
</style>
