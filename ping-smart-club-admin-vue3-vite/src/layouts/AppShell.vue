<script setup lang="ts">
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Users,
} from '@lucide/vue';
import { computed, ref } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

import BaseButton from '@/components/BaseButton.vue';
import { appConfig } from '@/config/app';
import { adminChildren } from '@/router/routes';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();
const collapsed = ref(false);
const mobileOpen = ref(false);

const iconMap = {
  LayoutDashboard,
  Users,
  BadgeCheck,
  BookOpen,
  MapPinned,
  CalendarDays,
  ClipboardList,
  CheckSquare,
  Bell,
};

const navItems = computed(() =>
  adminChildren
    .filter((item) => !item.meta?.hidden && auth.hasPermission(item.meta?.permission))
    .sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0)),
);

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <div class="app-shell" :class="{ collapsed }">
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <div class="brand">
        <div class="brand-mark">P</div>
        <div v-if="!collapsed" class="brand-text">
          <strong>{{ appConfig.appName }}</strong>
          <span>Admin Console</span>
        </div>
      </div>

      <nav class="side-nav" aria-label="后台菜单">
        <RouterLink
          v-for="item in navItems"
          :key="String(item.name)"
          class="nav-link"
          :to="{ name: item.name || undefined }"
          @click="mobileOpen = false"
        >
          <component :is="iconMap[item.meta?.icon as keyof typeof iconMap]" aria-hidden="true" />
          <span v-if="!collapsed">{{ item.meta?.title }}</span>
        </RouterLink>
      </nav>

      <BaseButton class="collapse-button" variant="ghost" @click="collapsed = !collapsed">
        <template #icon>
          <ChevronRight v-if="collapsed" />
          <ChevronLeft v-else />
        </template>
        <span v-if="!collapsed">收起菜单</span>
      </BaseButton>
    </aside>

    <div v-if="mobileOpen" class="mobile-mask" @click="mobileOpen = false" />

    <main class="main-area">
      <header class="topbar">
        <BaseButton class="mobile-menu" variant="ghost" aria-label="打开菜单" @click="mobileOpen = true">
          <template #icon><Menu /></template>
        </BaseButton>
        <div class="topbar-title">
          <strong>{{ appConfig.adminName }}</strong>
          <span>第一阶段管理工作台</span>
        </div>
        <div class="user-box">
          <div class="avatar">{{ auth.state.user?.name.slice(0, 1) }}</div>
          <div class="user-meta">
            <strong>{{ auth.state.user?.name }}</strong>
            <span>{{ auth.state.user?.role === 'super_admin' ? '超级管理员' : '运营管理员' }}</span>
          </div>
          <BaseButton variant="ghost" aria-label="退出登录" @click="logout">
            <template #icon><LogOut /></template>
          </BaseButton>
        </div>
      </header>

      <section class="content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
}

.app-shell.collapsed {
  grid-template-columns: 82px minmax(0, 1fr);
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid var(--color-border);
  background: #fff;
  padding: 14px;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  margin-bottom: 12px;
}

.brand-mark,
.avatar {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: #fff;
  font-weight: 800;
}

.brand-mark {
  width: 42px;
  height: 42px;
  font-size: 22px;
}

.brand-text,
.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brand-text span,
.user-meta span,
.topbar-title span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.side-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  padding: 0 12px;
  font-weight: 650;
}

.nav-link svg {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.collapse-button {
  width: 100%;
}

.main-area {
  min-width: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 66px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  padding: 0 22px;
}

.topbar-title {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-info);
}

.content {
  padding: 22px;
}

.mobile-menu,
.mobile-mask {
  display: none;
}

@media (max-width: 900px) {
  .app-shell,
  .app-shell.collapsed {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: fixed;
    left: 0;
    transform: translateX(-100%);
    width: 248px;
    transition: transform 0.2s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .mobile-menu {
    display: inline-flex;
  }

  .mobile-mask {
    position: fixed;
    inset: 0;
    z-index: 15;
    display: block;
    background: rgba(15, 23, 42, 0.28);
  }

  .topbar {
    padding: 0 14px;
  }

  .user-meta {
    display: none;
  }

  .content {
    padding: 16px;
  }
}
</style>
