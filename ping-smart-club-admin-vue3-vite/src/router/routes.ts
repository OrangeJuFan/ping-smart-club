import type { RouteRecordRaw } from 'vue-router';

import AppShell from '@/layouts/AppShell.vue';
import { PERMISSIONS } from '@/types/permission';

export const adminChildren: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '首页看板', icon: 'LayoutDashboard', permission: PERMISSIONS.DASHBOARD_VIEW, section: 'workbench', order: 10 },
  },
  {
    path: 'students',
    name: 'students',
    component: () => import('@/views/student/StudentManagement.vue'),
    meta: { title: '学员管理', icon: 'Users', permission: PERMISSIONS.STUDENT_MANAGE, section: 'business', order: 20 },
  },
  {
    path: 'coaches',
    name: 'coaches',
    component: () => import('@/views/coach/CoachManagement.vue'),
    meta: { title: '教练管理', icon: 'BadgeCheck', permission: PERMISSIONS.COACH_MANAGE, section: 'business', order: 30 },
  },
  {
    path: 'courses',
    name: 'courses',
    component: () => import('@/views/course/CourseManagement.vue'),
    meta: { title: '课程管理', icon: 'BookOpen', permission: PERMISSIONS.COURSE_MANAGE, section: 'business', order: 40 },
  },
  {
    path: 'venues',
    name: 'venues',
    component: () => import('@/views/field/FieldManagement.vue'),
    meta: { title: '场地管理', icon: 'MapPinned', permission: PERMISSIONS.VENUE_MANAGE, section: 'business', order: 50 },
  },
  {
    path: 'schedules',
    name: 'schedules',
    component: () => import('@/views/schedule/ScheduleManagement.vue'),
    meta: { title: '排课管理', icon: 'CalendarDays', permission: PERMISSIONS.SCHEDULE_MANAGE, section: 'business', order: 60 },
  },
  {
    path: 'bookings',
    name: 'bookings',
    component: () => import('@/views/booking/BookingManagement.vue'),
    meta: { title: '预约管理', icon: 'ClipboardList', permission: PERMISSIONS.BOOKING_MANAGE, section: 'business', order: 70 },
  },
  {
    path: 'attendance',
    name: 'attendance',
    component: () => import('@/views/attendance/AttendanceManagement.vue'),
    meta: { title: '考勤管理', icon: 'CheckSquare', permission: PERMISSIONS.ATTENDANCE_MANAGE, section: 'business', order: 80 },
  },
  {
    path: 'notifications',
    name: 'notifications',
    component: () => import('@/views/notification/NotificationManagement.vue'),
    meta: { title: '通知管理', icon: 'Bell', permission: PERMISSIONS.NOTIFICATION_VIEW, section: 'system', order: 90 },
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
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '无权限访问', hidden: true },
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
