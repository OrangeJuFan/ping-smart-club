<script setup lang="ts">
defineProps<{
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'teal' | 'blue' | 'orange' | 'green';
}>();
</script>

<template>
  <section class="stat-card" :class="tone || 'teal'">
    <div class="stat-meta">
      <span>{{ label }}</span>
      <strong>{{ value }}</strong>
    </div>
    <p v-if="hint">{{ hint }}</p>
  </section>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 118px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.stat-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-meta span,
.stat-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.stat-meta strong {
  font-size: 30px;
  line-height: 1;
}

.teal {
  border-top: 3px solid var(--color-primary);
}

.blue {
  border-top: 3px solid var(--color-info);
}

.orange {
  border-top: 3px solid var(--color-warning);
}

.green {
  border-top: 3px solid var(--color-success);
}
</style>
