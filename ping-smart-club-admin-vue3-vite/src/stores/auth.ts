import { reactive } from 'vue';

import { appConfig } from '@/config/app';
import { canAccess, ROLE_PERMISSION_MAP, type AdminRole, type PermissionKey } from '@/types/permission';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  permissions: PermissionKey[];
}

interface AuthState {
  token: string;
  user: AdminUser | null;
}

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

    const role: AdminRole = account.toLowerCase().includes('operator') ? 'operator' : 'super_admin';
    state.user = {
      id: role === 'operator' ? 'operator-001' : 'admin-001',
      name: role === 'operator' ? '运营管理员' : '超级管理员',
      role,
      permissions: ROLE_PERMISSION_MAP[role],
    };
    state.token = `mock-token-${Date.now()}`;
    persist();
  };

  const logout = () => {
    state.token = '';
    state.user = null;
    window.localStorage.removeItem(appConfig.storageKeys.auth);
  };

  const hasPermission = (permission?: PermissionKey) => canAccess(state.user?.permissions, permission);

  return {
    state,
    login,
    logout,
    hasPermission,
  };
}
