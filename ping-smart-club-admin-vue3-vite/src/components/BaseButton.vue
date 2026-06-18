<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
    size?: 'sm' | 'md';
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    type: 'button',
    loading: false,
  },
);
</script>

<template>
  <button class="base-button" :class="[variant, size]" :type="type" :disabled="loading">
    <span v-if="$slots.icon" class="button-icon">
      <slot name="icon" />
    </span>
    <span>{{ loading ? '处理中' : '' }}<slot v-if="!loading" /></span>
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-weight: 650;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
  white-space: nowrap;
}

.base-button.md {
  min-height: 36px;
  padding: 0 12px;
  font-size: 14px;
}

.base-button.sm {
  min-height: 30px;
  padding: 0 9px;
  font-size: 13px;
}

.primary {
  background: var(--color-primary);
  color: #fff;
}

.primary:hover {
  background: var(--color-primary-dark);
}

.secondary {
  border-color: var(--color-border);
  background: #fff;
  color: var(--color-text);
}

.secondary:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-muted);
}

.ghost {
  background: transparent;
  color: var(--color-text-muted);
}

.ghost:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}

.button-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
}
</style>
