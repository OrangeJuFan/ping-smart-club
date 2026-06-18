<script setup lang="ts">
import { X } from '@lucide/vue';

import BaseButton from '@/components/BaseButton.vue';

defineProps<{
  modelValue: boolean;
  title: string;
  width?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const close = () => emit('update:modelValue', false);
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="drawer-layer" role="dialog" aria-modal="true">
      <button class="drawer-mask" aria-label="关闭抽屉" @click="close" />
      <aside class="drawer-panel" :style="{ width: width || '560px' }">
        <header class="drawer-header">
          <h2>{{ title }}</h2>
          <BaseButton variant="ghost" size="sm" aria-label="关闭" @click="close">
            <template #icon><X /></template>
          </BaseButton>
        </header>
        <main class="drawer-body">
          <slot />
        </main>
        <footer v-if="$slots.footer" class="drawer-footer">
          <slot name="footer" />
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
}

.drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
}

.drawer-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: min(100vw, 720px);
  height: 100%;
  background: #fff;
  box-shadow: var(--shadow-md);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
  padding: 16px 18px;
}

.drawer-header h2 {
  margin: 0;
  font-size: 18px;
}

.drawer-body {
  flex: 1;
  overflow: auto;
  padding: 18px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--color-border);
  padding: 14px 18px;
}
</style>
