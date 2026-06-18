<script setup lang="ts">
import { Eye, RefreshCw } from '@lucide/vue';
import { computed, onMounted, ref } from 'vue';

import { adminApi } from '@/api/admin';
import BaseButton from '@/components/BaseButton.vue';
import BaseCard from '@/components/BaseCard.vue';
import DataTable, { type TableColumn } from '@/components/DataTable.vue';
import DataToolbar from '@/components/DataToolbar.vue';
import DetailDrawer from '@/components/DetailDrawer.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import type { NotificationLog } from '@/types/domain';
import { formatDateTime } from '@/utils/date';
import { includesText } from '@/utils/format';

const logs = ref<NotificationLog[]>([]);
const keyword = ref('');
const typeFilter = ref('');
const channelFilter = ref('');
const statusFilter = ref('');
const loading = ref(false);
const detailOpen = ref(false);
const selected = ref<NotificationLog | null>(null);

const columns: TableColumn[] = [
  { key: 'type', label: '通知类型' },
  { key: 'receiver', label: '接收人' },
  { key: 'channel', label: '渠道' },
  { key: 'content', label: '内容' },
  { key: 'createdAtText', label: '生成时间' },
  { key: 'status', label: '状态', width: '96px' },
];

const rows = computed(() =>
  logs.value
    .map((log) => ({ ...log, createdAtText: formatDateTime(log.createdAt) }))
    .filter((log) => !typeFilter.value || log.type === typeFilter.value)
    .filter((log) => !channelFilter.value || log.channel === channelFilter.value)
    .filter((log) => !statusFilter.value || log.status === statusFilter.value)
    .filter((log) => [log.type, log.receiver, log.channel, log.content].some((value) => includesText(value, keyword.value))),
);

const load = async () => {
  loading.value = true;
  try {
    const resp = await adminApi.getNotifications();
    logs.value = resp.data;
  } finally {
    loading.value = false;
  }
};

const openDetail = (log: NotificationLog) => {
  selected.value = log;
  detailOpen.value = true;
};

onMounted(load);
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1 class="page-title">通知管理</h1>
        <p class="page-description">查看预约成功、取消、调课、课前提醒等消息生成记录，便于第一阶段排查。</p>
      </div>
    </header>

    <BaseCard>
      <DataToolbar v-model:keyword="keyword" placeholder="搜索接收人、渠道、内容">
        <template #filters>
          <select v-model="typeFilter" class="select">
            <option value="">全部类型</option>
            <option value="预约成功">预约成功</option>
            <option value="取消通知">取消通知</option>
            <option value="调课通知">调课通知</option>
            <option value="课前提醒">课前提醒</option>
            <option value="候补提醒">候补提醒</option>
          </select>
          <select v-model="channelFilter" class="select">
            <option value="">全部渠道</option>
            <option value="短信">短信</option>
            <option value="微信">微信</option>
            <option value="系统">系统</option>
          </select>
          <select v-model="statusFilter" class="select">
            <option value="">全部状态</option>
            <option value="sent">已生成</option>
            <option value="failed">生成失败</option>
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
        <template #cell-content="{ value }">
          <span class="content-cell">{{ value }}</span>
        </template>
        <template #cell-status="{ value }"><StatusBadge :status="String(value)" /></template>
        <template #actions="{ row }">
          <div class="row-actions">
            <BaseButton size="sm" @click="openDetail(row)">
              <template #icon><Eye /></template>
              详情
            </BaseButton>
          </div>
        </template>
      </DataTable>
    </BaseCard>

    <DetailDrawer v-model="detailOpen" title="通知详情" width="520px">
      <dl v-if="selected" class="detail-list">
        <dt>通知类型</dt>
        <dd>{{ selected.type }}</dd>
        <dt>接收人</dt>
        <dd>{{ selected.receiver }}</dd>
        <dt>渠道</dt>
        <dd>{{ selected.channel }}</dd>
        <dt>关联业务 ID</dt>
        <dd>{{ selected.relatedId || '-' }}</dd>
        <dt>状态</dt>
        <dd><StatusBadge :status="selected.status" /></dd>
        <dt>生成时间</dt>
        <dd>{{ formatDateTime(selected.createdAt) }}</dd>
        <dt>消息内容</dt>
        <dd>{{ selected.content }}</dd>
      </dl>
    </DetailDrawer>
  </div>
</template>

<style scoped>
.content-cell {
  display: inline-block;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: bottom;
  white-space: nowrap;
}

.detail-list {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 12px;
  margin: 0;
}

.detail-list dt {
  color: var(--color-text-muted);
  font-weight: 700;
}

.detail-list dd {
  margin: 0;
}
</style>
