import { reactive } from 'vue';

import { appConfig } from '@/config/app';

export interface AdminUser {
  id: string;
  name: string;
  role: 'super_admin' | 'operator';
  permissions: string[];
}

interface AuthState {
  token: string;
  user: AdminUser | null;
}

const allPermissions = [
  'dashboard:view',
  'student:manage',
  'coach:manage',
  'course:manage',
  'venue:manage',
  'schedule:manage',
  'booking:manage',
  'attendance:manage',
  'notification:view',
];

const readStorage = (): AuthState => {
  const raw = window.localStorage.getItem(appConfig.storageKeys.auth);
  if (!raw) return { token: '', user: null };

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    window.localStorage.removeItem(appConfig.storageKeys.auth);
    return { token: '', user: null };
  }
};

const state = reactive<AuthState>(readStorage());

function persist() {
  window.localStorage.setItem(appConfig.storageKeys.auth, JSON.stringify(state));
}

export function useAuthStore() {
  const login = async (account: string, password: string) => {
    if (!account.trim() || password.length < 4) {
      throw new Error('请输入账号，并使用至少 4 位密码');
    }

    const isOperator = account.toLowerCase().includes('operator');
    state.user = {
      id: isOperator ? 'operator-001' : 'admin-001',
      name: isOperator ? '运营管理员' : '超级管理员',
      role: isOperator ? 'operator' : 'super_admin',
      permissions: isOperator
        ? ['dashboard:view', 'student:manage', 'schedule:manage', 'booking:manage', 'attendance:manage']
        : allPermissions,
    };
    state.token = `mock-token-${Date.now()}`;
    persist();
  };

  const logout = () => {
    state.token = '';
    state.user = null;
    window.localStorage.removeItem(appConfig.storageKeys.auth);
  };

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return Boolean(state.user?.permissions.includes(permission));
  };

  return {
    state,
    login,
    logout,
    hasPermission,
  };
}
