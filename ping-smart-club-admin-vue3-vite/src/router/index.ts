import { createRouter, createWebHistory } from 'vue-router';

import { routes } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const needsAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (needsAuth && !auth.state.token) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.name === 'login' && auth.state.token) {
    return { name: 'dashboard' };
  }

  const denied = to.matched.some((record) => !auth.hasPermission(record.meta.permission));
  if (denied) {
    return { name: 'forbidden', query: { from: to.fullPath } };
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - Ping Smart Club` : 'Ping Smart Club Admin';
});
