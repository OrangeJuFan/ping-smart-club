<script setup lang="ts">
import { X } from '@lucide/vue';
import { computed } from 'vue';

import BaseButton from '@/components/BaseButton.vue';

const props = withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  width?: string;
  mode?: 'create' | 'edit' | 'view';
  submitLoading?: boolean;
  closeConfirm?: boolean;
}>(), {
  submitLoading: false,
  closeConfirm: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const modeText = {
  create: '新增',
  edit: '编辑',
  view: '查看',
};

const modeLabel = computed(() => (props.mode ? modeText[props.mode] : ''));

const close = () => {
  if (props.closeConfirm && !window.confirm('当前内容尚未保存，确认关闭？')) return;
  emit('update:modelValue', false);
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="drawer-layer" role="dialog" aria-modal="true">
      <button class="drawer-mask" aria-label="关闭抽屉" @click="close" />
      <aside class="drawer-panel" :style="{ width: width || '560px' }">
        <header class="drawer-header">
          <div class="drawer-title">
            <h2>{{ title }}</h2>
            <span v-if="modeLabel">{{ modeLabel }}</span>
          </div>
          <BaseButton variant="ghost" size="sm" aria-label="关闭" @click="close">
            <template #icon><X /></template>
          </BaseButton>
        </header>
        <main class="drawer-body">
          <slot />
        </main>
        <footer v-if="$slots.footer" class="drawer-footer" :class="{ submitting: submitLoading }">
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

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-title h2 {
  margin: 0;
  font-size: 18px;
}

.drawer-title span {
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 700;
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

.drawer-footer.submitting {
  pointer-events: none;
  opacity: 0.72;
}
</style>
