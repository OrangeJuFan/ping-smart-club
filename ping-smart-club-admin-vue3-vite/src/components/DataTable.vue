<script setup lang="ts">
import { computed } from 'vue';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    rows: any[];
    rowKey?: string;
    emptyText?: string;
    loading?: boolean;
    errorText?: string;
    pagination?: TablePagination;
    sortKey?: string;
    sortOrder?: 'asc' | 'desc';
  }>(),
  {
    rowKey: 'id',
    emptyText: '暂无数据',
    loading: false,
    errorText: '',
    pagination: undefined,
    sortKey: '',
    sortOrder: undefined,
  },
);

const emit = defineEmits<{
  retry: [];
  'update:page': [page: number];
  'sort-change': [payload: { key: string; order: 'asc' | 'desc' }];
}>();

const totalPages = computed(() => {
  if (!props.pagination) return 1;
  return Math.max(1, Math.ceil(props.pagination.total / props.pagination.pageSize));
});

function changeSort(column: TableColumn) {
  if (!column.sortable) return;
  const nextOrder = props.sortKey === column.key && props.sortOrder === 'asc' ? 'desc' : 'asc';
  emit('sort-change', { key: column.key, order: nextOrder });
}
</script>

<template>
  <div class="table-shell">
    <div v-if="loading" class="table-state">加载中...</div>
    <div v-else-if="errorText" class="table-state error-state">
      <span>{{ errorText }}</span>
      <button type="button" @click="emit('retry')">重试</button>
    </div>
    <div class="table-wrap" :class="{ dimmed: loading || errorText }">
    <table class="data-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="{ sortable: column.sortable }"
            :style="{ width: column.width, textAlign: column.align || 'left' }"
            @click="changeSort(column)"
          >
            {{ column.label }}
            <span v-if="column.sortable && sortKey === column.key" class="sort-mark">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th v-if="$slots.actions" class="actions-head">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td class="empty-cell" :colspan="columns.length + ($slots.actions ? 1 : 0)">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-for="row in rows" v-else :key="String(row[rowKey])">
          <td
            v-for="column in columns"
            :key="column.key"
            :style="{ textAlign: column.align || 'left' }"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] ?? '-' }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-cell">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    <footer v-if="pagination" class="table-pagination">
      <span>共 {{ pagination.total }} 条</span>
      <button type="button" :disabled="pagination.page <= 1" @click="emit('update:page', pagination.page - 1)">
        上一页
      </button>
      <span>{{ pagination.page }} / {{ totalPages }}</span>
      <button
        type="button"
        :disabled="pagination.page >= totalPages"
        @click="emit('update:page', pagination.page + 1)"
      >
        下一页
      </button>
    </footer>
  </div>
</template>

<style scoped>
.table-shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.dimmed {
  opacity: 0.62;
  pointer-events: none;
}

.data-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  border-bottom: 1px solid var(--color-border);
  padding: 11px 12px;
  vertical-align: middle;
  font-size: 14px;
}

th {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 750;
  text-transform: none;
}

th.sortable {
  cursor: pointer;
}

.sort-mark {
  margin-left: 4px;
  color: var(--color-primary);
}

tbody tr:hover {
  background: #fbfcfd;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.actions-head,
.actions-cell {
  width: 1%;
  white-space: nowrap;
  text-align: right;
}

.actions-cell :deep(.row-actions) {
  display: inline-flex;
  justify-content: flex-end;
  gap: 6px;
}

.empty-cell {
  height: 120px;
  color: var(--color-text-muted);
  text-align: center;
}

.table-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 42px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 13px;
}

.error-state {
  color: var(--color-danger);
}

.error-state button,
.table-pagination button {
  min-height: 28px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 0 9px;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
}
</style>
