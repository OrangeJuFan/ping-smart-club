<script setup lang="ts">
import { computed } from 'vue';

import { statusText } from '@/config/app';

const props = defineProps<{
  status: string;
  text?: string;
}>();

const label = computed(() => props.text || statusText[props.status as keyof typeof statusText] || props.status);
const tone = computed(() => {
  if (['active', 'online', 'booked', 'present', 'sent', 'finished', 'consumed'].includes(props.status)) return 'green';
  if (['scheduled', 'waitlisted', 'teaching'].includes(props.status)) return 'blue';
  if (['leave'].includes(props.status)) return 'orange';
  if (['inactive', 'offline', 'canceled', 'absent', 'failed'].includes(props.status)) return 'red';
  return 'gray';
});
</script>

<template>
  <span class="status-badge" :class="tone">{{ label }}</span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border-radius: 999px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.green {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.blue {
  background: #e8f0ff;
  color: var(--color-info);
}

.orange {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.red {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.gray {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
}
</style>
