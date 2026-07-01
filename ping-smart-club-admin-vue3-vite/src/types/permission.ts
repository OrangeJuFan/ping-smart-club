export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  STUDENT_MANAGE: 'student:manage',
  COACH_MANAGE: 'coach:manage',
  COURSE_MANAGE: 'course:manage',
  VENUE_MANAGE: 'venue:manage',
  SCHEDULE_MANAGE: 'schedule:manage',
  BOOKING_MANAGE: 'booking:manage',
  ATTENDANCE_MANAGE: 'attendance:manage',
  NOTIFICATION_VIEW: 'notification:view',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type AdminRole = 'super_admin' | 'operator';

export interface AdminMenuMeta {
  title: string;
  icon?: string;
  permission?: PermissionKey;
  hidden?: boolean;
  section?: 'workbench' | 'business' | 'system';
  order?: number;
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSION_MAP: Record<AdminRole, PermissionKey[]> = {
  super_admin: ALL_PERMISSIONS,
  operator: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENT_MANAGE,
    PERMISSIONS.SCHEDULE_MANAGE,
    PERMISSIONS.BOOKING_MANAGE,
    PERMISSIONS.ATTENDANCE_MANAGE,
  ],
};

export function canAccess(permissions: PermissionKey[] | undefined, permission?: PermissionKey): boolean {
  if (!permission) return true;
  return Boolean(permissions?.includes(permission));
}
