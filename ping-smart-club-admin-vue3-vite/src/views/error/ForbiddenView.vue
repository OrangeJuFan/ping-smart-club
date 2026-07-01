<script setup lang="ts">
import { ShieldAlert } from '@lucide/vue';
import { useRoute, useRouter } from 'vue-router';

import BaseButton from '@/components/BaseButton.vue';

const route = useRoute();
const router = useRouter();
</script>

<template>
  <main class="forbidden-page">
    <section class="forbidden-panel">
      <ShieldAlert aria-hidden="true" />
      <h1>无权限访问</h1>
      <p>当前账号没有访问该页面的权限。</p>
      <p v-if="route.query.from" class="from-path">来源：{{ route.query.from }}</p>
      <div class="actions">
        <BaseButton @click="router.back()">返回上一页</BaseButton>
        <BaseButton variant="primary" @click="router.replace({ name: 'dashboard' })">回到首页</BaseButton>
      </div>
    </section>
  </main>
</template>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--color-bg);
  padding: 24px;
}

.forbidden-panel {
  width: min(420px, 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-sm);
  padding: 28px;
  text-align: center;
}

.forbidden-panel svg {
  width: 44px;
  height: 44px;
  color: var(--color-warning);
}

.forbidden-panel h1 {
  margin: 12px 0 6px;
  font-size: 22px;
}

.forbidden-panel p {
  margin: 0;
  color: var(--color-text-muted);
}

.from-path {
  margin-top: 8px;
  word-break: break-all;
  font-size: 12px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
</style>
