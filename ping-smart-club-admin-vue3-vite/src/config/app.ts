export const appConfig = {
  appName: 'Ping Smart Club',
  adminName: '智慧乒乓俱乐部后台',
  storageKeys: {
    auth: 'ping-smart-club-admin-auth',
  },
  mockLatencyMs: 160,
  lowBalanceThreshold: 4,
  defaultCapacity: 8,
  scheduleHours: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
  weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  businessPhone: '400-888-2026',
} as const;

export const statusText = {
  active: '启用',
  inactive: '停用',
  online: '上架',
  offline: '下架',
  booked: '已预约',
  waitlisted: '候补中',
  canceled: '已取消',
  consumed: '已消课',
  scheduled: '待上课',
  teaching: '上课中',
  finished: '已完成',
  absent: '旷课',
  leave: '请假',
  present: '到课',
  sent: '已生成',
  failed: '生成失败',
} as const;

export type StatusKey = keyof typeof statusText;
