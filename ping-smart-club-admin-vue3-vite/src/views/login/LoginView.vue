<script setup lang="ts">
import { LockKeyhole, LogIn, User } from '@lucide/vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BaseButton from '@/components/BaseButton.vue';
import { appConfig } from '@/config/app';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const account = ref('admin');
const password = ref('123456');
const loading = ref(false);
const error = ref('');

const submit = async () => {
  loading.value = true;
  error.value = '';

  try {
    await auth.login(account.value, password.value);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    router.replace(redirect);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="login-page">
    <section class="login-panel">
      <div class="login-brand">
        <div class="brand-mark">P</div>
        <div>
          <h1>{{ appConfig.adminName }}</h1>
          <p>课程、学员、预约与考勤的一站式后台</p>
        </div>
      </div>

      <form class="login-form" @submit.prevent="submit">
        <label class="field">
          <span>管理员账号</span>
          <div class="input-icon">
            <User aria-hidden="true" />
            <input v-model.trim="account" autocomplete="username" placeholder="admin / operator" />
          </div>
        </label>
        <label class="field">
          <span>登录密码</span>
          <div class="input-icon">
            <LockKeyhole aria-hidden="true" />
            <input v-model="password" autocomplete="current-password" placeholder="至少 4 位" type="password" />
          </div>
        </label>
        <p v-if="error" class="error-text">{{ error }}</p>
        <BaseButton class="login-button" variant="primary" type="submit" :loading="loading">
          <template #icon><LogIn /></template>
          登录后台
        </BaseButton>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.1), transparent 35%),
    linear-gradient(45deg, rgba(37, 99, 235, 0.08), transparent 36%),
    var(--color-bg);
}

.login-panel {
  width: min(440px, 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  box-shadow: var(--shadow-md);
  padding: 28px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
}

h1 {
  margin: 0;
  font-size: 22px;
}

p {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field span {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.input-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0 12px;
}

.input-icon:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
}

.input-icon svg {
  width: 17px;
  height: 17px;
  color: var(--color-text-muted);
}

.input-icon input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
}

.error-text {
  color: var(--color-danger);
  font-size: 13px;
}

.login-button {
  width: 100%;
}
</style>
