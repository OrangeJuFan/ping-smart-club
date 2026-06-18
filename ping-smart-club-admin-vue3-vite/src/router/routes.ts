import type { RouteRecordRaw } from 'vue-router';

import AppShell from '@/layouts/AppShell.vue';

export const adminChildren: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '首页看板', icon: 'LayoutDashboard', permission: 'dashboard:view' },
  },
  {
    path: 'students',
    name: 'students',
    component: () => import('@/views/student/StudentManagement.vue'),
    meta: { title: '学员管理', icon: 'Users', permission: 'student:manage' },
  },
  {
    path: 'coaches',
    name: 'coaches',
    component: () => import('@/views/coach/CoachManagement.vue'),
    meta: { title: '教练管理', icon: 'BadgeCheck', permission: 'coach:manage' },
  },
  {
    path: 'courses',
    name: 'courses',
    component: () => import('@/views/course/CourseManagement.vue'),
    meta: { title: '课程管理', icon: 'BookOpen', permission: 'course:manage' },
  },
  {
    path: 'venues',
    name: 'venues',
    component: () => import('@/views/field/FieldManagement.vue'),
    meta: { title: '场地管理', icon: 'MapPinned', permission: 'venue:manage' },
  },
  {
    path: 'schedules',
    name: 'schedules',
    component: () => import('@/views/schedule/ScheduleManagement.vue'),
    meta: { title: '排课管理', icon: 'CalendarDays', permission: 'schedule:manage' },
  },
  {
    path: 'bookings',
    name: 'bookings',
    component: () => import('@/views/booking/BookingManagement.vue'),
    meta: { title: '预约管理', icon: 'ClipboardList', permission: 'booking:manage' },
  },
  {
    path: 'attendance',
    name: 'attendance',
    component: () => import('@/views/attendance/AttendanceManagement.vue'),
    meta: { title: '考勤管理', icon: 'CheckSquare', permission: 'attendance:manage' },
  },
  {
    path: 'notifications',
    name: 'notifications',
    component: () => import('@/views/notification/NotificationManagement.vue'),
    meta: { title: '通知管理', icon: 'Bell', permission: 'notification:view' },
  },
];

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '管理员登录', hidden: true },
  },
  {
    path: '/',
    component: AppShell,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: adminChildren,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
    meta: { hidden: true },
  },
];
