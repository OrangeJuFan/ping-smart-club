<script setup lang="ts">
import { Search } from '@lucide/vue';

defineProps<{
  keyword: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:keyword': [value: string];
}>();
</script>

<template>
  <div class="data-toolbar">
    <label class="search-box">
      <Search aria-hidden="true" />
      <input
        :value="keyword"
        :placeholder="placeholder || '搜索'"
        @input="emit('update:keyword', ($event.target as HTMLInputElement).value)"
      />
    </label>
    <div v-if="$slots.filters" class="toolbar-filters">
      <slot name="filters" />
    </div>
    <div v-if="$slots.actions" class="toolbar-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.data-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.search-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: min(320px, 100%);
  min-height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  padding: 0 10px;
}

.search-box svg {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  min-width: 0;
}

.toolbar-filters,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.toolbar-actions {
  margin-left: auto;
}
</style>
