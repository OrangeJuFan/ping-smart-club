<script setup lang="ts">
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

withDefaults(
  defineProps<{
    columns: TableColumn[];
    rows: any[];
    rowKey?: string;
    emptyText?: string;
  }>(),
  {
    rowKey: 'id',
    emptyText: '暂无数据',
  },
);
</script>

<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width, textAlign: column.align || 'left' }"
          >
            {{ column.label }}
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
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
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
</style>
