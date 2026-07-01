import 'vue-router';

import type { AdminMenuMeta } from '@/types/permission';

export {};

declare module 'vue-router' {
  interface RouteMeta extends Partial<AdminMenuMeta> {
    requiresAuth?: boolean;
  }
}
