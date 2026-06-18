import { appConfig } from '@/config/app';
import type {
  Attendance,
  Booking,
  Coach,
  CourseProduct,
  CourseType,
  NotificationLog,
  Schedule,
  Student,
  Venue,
} from '@/types/domain';
import { addDays, formatDate } from '@/utils/date';

const today = new Date();
const at = (dayOffset: number, time: string) => `${formatDate(addDays(today, dayOffset))}T${time}:00`;

export const students: Student[] = [
  {
    id: 'stu-001',
    name: '林一辰',
    phone: '13800010001',
    age: 10,
    level: '启蒙班',
    balance: 12,
    guardian: { name: '林女士', relation: '妈妈', phone: '13900010001', wechat: 'lin-mom' },
    status: 'active',
    remark: '反手练习稳定，适合小班课。',
    createdAt: at(-24, '09:00'),
  },
  {
    id: 'stu-002',
    name: '陈嘉禾',
    phone: '13800010002',
    age: 12,
    level: '进阶班',
    balance: 3,
    guardian: { name: '陈先生', relation: '爸爸', phone: '13900010002' },
    status: 'active',
    remark: '课时余额偏低，预约前需提醒续费。',
    createdAt: at(-18, '14:30'),
  },
  {
    id: 'stu-003',
    name: '周安安',
    phone: '13800010003',
    age: 8,
    level: '体验课',
    balance: 1,
    guardian: { name: '周女士', relation: '妈妈', phone: '13900010003' },
    status: 'active',
    createdAt: at(-8, '10:00'),
  },
  {
    id: 'stu-004',
    name: '王浩宇',
    phone: '13800010004',
    age: 15,
    level: '校队提升',
    balance: 18,
    guardian: { name: '王先生', relation: '爸爸', phone: '13900010004' },
    status: 'inactive',
    createdAt: at(-62, '18:00'),
  },
];

export const coaches: Coach[] = [
  {
    id: 'coach-001',
    name: '赵明',
    phone: '13600020001',
    title: '高级教练',
    courseTypes: ['启蒙训练', '进阶小班'],
    certifications: ['国家二级运动员', '青少年体适能证书'],
    availableTimes: ['周一 16:00-20:00', '周三 16:00-20:00', '周六 09:00-18:00'],
    leaveDates: [],
    status: 'active',
  },
  {
    id: 'coach-002',
    name: '钱雅',
    phone: '13600020002',
    title: '主教练',
    courseTypes: ['进阶小班', '校队提升'],
    certifications: ['ITTF Level 1', '国家一级裁判'],
    availableTimes: ['周二 14:00-20:00', '周四 14:00-20:00', '周日 09:00-18:00'],
    leaveDates: [formatDate(addDays(today, 2))],
    status: 'active',
  },
  {
    id: 'coach-003',
    name: '孙凯',
    phone: '13600020003',
    title: '助理教练',
    courseTypes: ['体验课', '启蒙训练'],
    certifications: ['少儿乒乓专项培训'],
    availableTimes: ['周五 16:00-20:00', '周六 09:00-12:00'],
    leaveDates: [],
    status: 'inactive',
  },
];

export const courseTypes: CourseType[] = [
  { id: 'type-001', name: '体验课', description: '新学员入门评估与兴趣体验。', status: 'active' },
  { id: 'type-002', name: '启蒙训练', description: '基本握拍、步法和稳定击球。', status: 'active' },
  { id: 'type-003', name: '进阶小班', description: '发接发、旋转和战术训练。', status: 'active' },
  { id: 'type-004', name: '校队提升', description: '高强度专项和比赛能力提升。', status: 'active' },
];

export const products: CourseProduct[] = [
  {
    id: 'prod-001',
    typeId: 'type-001',
    name: '单次体验课',
    capacity: 4,
    price: 99,
    creditCost: 1,
    durationMinutes: 60,
    status: 'online',
  },
  {
    id: 'prod-002',
    typeId: 'type-002',
    name: '启蒙小班课',
    capacity: appConfig.defaultCapacity,
    price: 180,
    creditCost: 1,
    durationMinutes: 90,
    status: 'online',
  },
  {
    id: 'prod-003',
    typeId: 'type-003',
    name: '进阶精品课',
    capacity: 6,
    price: 260,
    creditCost: 2,
    durationMinutes: 90,
    status: 'online',
  },
  {
    id: 'prod-004',
    typeId: 'type-004',
    name: '校队专项训练',
    capacity: 4,
    price: 360,
    creditCost: 3,
    durationMinutes: 120,
    status: 'offline',
  },
];

export const venues: Venue[] = [
  { id: 'venue-001', name: '一号球台区', area: 'A 区', capacity: 8, status: 'active' },
  { id: 'venue-002', name: '二号球台区', area: 'A 区', capacity: 6, status: 'active' },
  { id: 'venue-003', name: '专项训练室', area: 'B 区', capacity: 4, status: 'active' },
  { id: 'venue-004', name: '备用球台', area: 'C 区', capacity: 4, status: 'inactive', remark: '设备维护中' },
];

export const schedules: Schedule[] = [
  {
    id: 'sch-001',
    productId: 'prod-002',
    coachId: 'coach-001',
    venueId: 'venue-001',
    startTime: at(0, '16:00'),
    endTime: at(0, '17:30'),
    capacity: 8,
    bookedCount: 6,
    waitlistCount: 1,
    status: 'scheduled',
  },
  {
    id: 'sch-002',
    productId: 'prod-003',
    coachId: 'coach-002',
    venueId: 'venue-003',
    startTime: at(0, '18:00'),
    endTime: at(0, '19:30'),
    capacity: 6,
    bookedCount: 5,
    waitlistCount: 0,
    status: 'scheduled',
  },
  {
    id: 'sch-003',
    productId: 'prod-001',
    coachId: 'coach-003',
    venueId: 'venue-002',
    startTime: at(1, '10:00'),
    endTime: at(1, '11:00'),
    capacity: 4,
    bookedCount: 4,
    waitlistCount: 2,
    status: 'scheduled',
  },
  {
    id: 'sch-004',
    productId: 'prod-004',
    coachId: 'coach-002',
    venueId: 'venue-003',
    startTime: at(3, '14:00'),
    endTime: at(3, '16:00'),
    capacity: 4,
    bookedCount: 3,
    waitlistCount: 0,
    status: 'scheduled',
  },
];

export const bookings: Booking[] = [
  { id: 'book-001', studentId: 'stu-001', scheduleId: 'sch-001', status: 'booked', createdAt: at(-2, '09:12') },
  { id: 'book-002', studentId: 'stu-002', scheduleId: 'sch-001', status: 'booked', createdAt: at(-2, '10:24') },
  { id: 'book-003', studentId: 'stu-003', scheduleId: 'sch-001', status: 'waitlisted', createdAt: at(-1, '12:10') },
  { id: 'book-004', studentId: 'stu-004', scheduleId: 'sch-002', status: 'canceled', createdAt: at(-4, '08:20'), cancelReason: '家长临时请假' },
  { id: 'book-005', studentId: 'stu-001', scheduleId: 'sch-002', status: 'consumed', createdAt: at(-8, '16:00') },
];

export const attendance: Attendance[] = [
  { id: 'att-001', scheduleId: 'sch-001', studentId: 'stu-001', role: 'student', status: 'scheduled' },
  { id: 'att-002', scheduleId: 'sch-001', studentId: 'stu-002', role: 'student', status: 'scheduled' },
  { id: 'att-003', scheduleId: 'sch-001', coachId: 'coach-001', role: 'coach', status: 'scheduled' },
  { id: 'att-004', scheduleId: 'sch-002', studentId: 'stu-001', role: 'student', status: 'present', checkedAt: at(-8, '18:02') },
  { id: 'att-005', scheduleId: 'sch-002', coachId: 'coach-002', role: 'coach', status: 'present', checkedAt: at(-8, '17:55') },
];

export const notifications: NotificationLog[] = [
  {
    id: 'msg-001',
    type: '预约成功',
    receiver: '林女士',
    channel: '微信',
    content: '林一辰已预约今日 16:00 启蒙小班课。',
    relatedId: 'book-001',
    status: 'sent',
    createdAt: at(-2, '09:13'),
  },
  {
    id: 'msg-002',
    type: '取消通知',
    receiver: '王先生',
    channel: '短信',
    content: '王浩宇的进阶精品课预约已取消。',
    relatedId: 'book-004',
    status: 'sent',
    createdAt: at(-3, '18:21'),
  },
  {
    id: 'msg-003',
    type: '候补提醒',
    receiver: '周女士',
    channel: '系统',
    content: '周安安当前排在候补第 1 位。',
    relatedId: 'book-003',
    status: 'sent',
    createdAt: at(-1, '12:11'),
  },
  {
    id: 'msg-004',
    type: '课前提醒',
    receiver: '陈先生',
    channel: '微信',
    content: '陈嘉禾今日 16:00 有启蒙小班课，请提前到场。',
    relatedId: 'sch-001',
    status: 'failed',
    createdAt: at(0, '10:00'),
  },
];
