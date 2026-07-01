import { at, formatDateKey } from './date'

export const createInitialStore = () => ({
  version: 1,
  generatedDate: formatDateKey(new Date()),
  currentGuardianId: '',
  selectedStudentId: '',
  guardians: [
    { id: 'guardian-001', name: '林女士', phone: '13900010001', relation: '妈妈', wechatOpenId: 'wx-lin-mom' },
    { id: 'guardian-002', name: '陈先生', phone: '13900010002', relation: '爸爸', wechatOpenId: 'wx-chen-dad' }
  ],
  students: [
    {
      id: 'student-001',
      name: '林一辰',
      phone: '13800010001',
      age: 10,
      level: '启蒙班',
      balance: 12,
      guardianIds: ['guardian-001'],
      avatarColor: '#0f766e',
      remark: '反手练习稳定，适合小班课。'
    },
    {
      id: 'student-002',
      name: '陈嘉禾',
      phone: '13800010002',
      age: 12,
      level: '进阶班',
      balance: 2,
      guardianIds: ['guardian-002'],
      avatarColor: '#b45309',
      remark: '余额偏低，预约进阶课前建议续费。'
    },
    {
      id: 'student-003',
      name: '林小满',
      phone: '13800010003',
      age: 8,
      level: '体验课',
      balance: 1,
      guardianIds: ['guardian-001'],
      avatarColor: '#2563eb',
      remark: '刚完成体验测评，可从启蒙大班开始。'
    }
  ],
  courseTypes: [
    { id: 'type-001', code: 'one-to-one', name: '1 对 1', shortName: '1v1', creditCost: 3, duration: 60, capacity: 1 },
    { id: 'type-002', code: 'one-to-two', name: '1 对 2', shortName: '1v2', creditCost: 2, duration: 75, capacity: 2 },
    { id: 'type-003', code: 'trial', name: '体验课', shortName: '体验', creditCost: 1, duration: 60, capacity: 4 },
    { id: 'type-004', code: 'group', name: '大班课', shortName: '大班', creditCost: 1, duration: 90, capacity: 8 }
  ],
  coaches: [
    { id: 'coach-001', name: '赵明', title: '高级教练', courseTypeCodes: ['one-to-one', 'one-to-two', 'group'] },
    { id: 'coach-002', name: '钱雅', title: '主教练', courseTypeCodes: ['one-to-one', 'one-to-two'] },
    { id: 'coach-003', name: '孙凯', title: '启蒙教练', courseTypeCodes: ['trial', 'group'] }
  ],
  venues: [
    { id: 'venue-001', name: '一号球台区', address: '俱乐部 2F A 区' },
    { id: 'venue-002', name: '二号球台区', address: '俱乐部 2F A 区' },
    { id: 'venue-003', name: '专项训练室', address: '俱乐部 3F B 区' }
  ],
  schedules: [
    {
      id: 'schedule-001',
      courseTypeId: 'type-001',
      coachId: 'coach-001',
      venueId: 'venue-003',
      startTime: at(0, '16:00'),
      endTime: at(0, '17:00'),
      capacity: 1,
      bookedCount: 1,
      waitlistCount: 0,
      status: 'full',
      note: '反手稳定性专项。'
    },
    {
      id: 'schedule-002',
      courseTypeId: 'type-002',
      coachId: 'coach-002',
      venueId: 'venue-001',
      startTime: at(0, '18:00'),
      endTime: at(0, '19:15'),
      capacity: 2,
      bookedCount: 1,
      waitlistCount: 0,
      status: 'open',
      note: '适合有基础击球经验的学员。'
    },
    {
      id: 'schedule-003',
      courseTypeId: 'type-003',
      coachId: 'coach-003',
      venueId: 'venue-002',
      startTime: at(1, '10:00'),
      endTime: at(1, '11:00'),
      capacity: 4,
      bookedCount: 4,
      waitlistCount: 2,
      status: 'full',
      note: '满员后可加入候补。'
    },
    {
      id: 'schedule-004',
      courseTypeId: 'type-004',
      coachId: 'coach-003',
      venueId: 'venue-001',
      startTime: at(1, '19:00'),
      endTime: at(1, '20:30'),
      capacity: 8,
      bookedCount: 3,
      waitlistCount: 0,
      status: 'open',
      note: '基础步法和多球训练。'
    },
    {
      id: 'schedule-005',
      courseTypeId: 'type-001',
      coachId: 'coach-002',
      venueId: 'venue-003',
      startTime: at(2, '15:00'),
      endTime: at(2, '16:00'),
      capacity: 1,
      bookedCount: 0,
      waitlistCount: 0,
      status: 'open',
      note: '发接发专项提升。'
    },
    {
      id: 'schedule-006',
      courseTypeId: 'type-004',
      coachId: 'coach-001',
      venueId: 'venue-001',
      startTime: at(-5, '17:00'),
      endTime: at(-5, '18:30'),
      capacity: 8,
      bookedCount: 8,
      waitlistCount: 0,
      status: 'closed',
      note: '历史课程。'
    }
  ],
  bookings: [
    { id: 'booking-001', studentId: 'student-001', scheduleId: 'schedule-002', status: 'booked', createdAt: at(-1, '09:12') },
    { id: 'booking-002', studentId: 'student-001', scheduleId: 'schedule-006', status: 'completed', createdAt: at(-7, '13:20'), checkedInAt: at(-5, '16:54'), completedAt: at(-5, '18:30') },
    { id: 'booking-003', studentId: 'student-003', scheduleId: 'schedule-003', status: 'waitlisted', waitlistRank: 1, createdAt: at(-1, '12:10') },
    { id: 'booking-004', studentId: 'student-002', scheduleId: 'schedule-001', status: 'booked', createdAt: at(-1, '08:40') },
    { id: 'booking-005', studentId: 'student-001', scheduleId: 'schedule-001', status: 'cancelled', createdAt: at(-3, '10:30'), cancelReason: '家长临时取消' }
  ],
  creditRecords: [
    { id: 'credit-001', studentId: 'student-001', type: 'recharge', amount: 16, balanceAfter: 16, title: '购买 16 课时包', createdAt: at(-14, '10:00') },
    { id: 'credit-002', studentId: 'student-001', type: 'consume', amount: -1, balanceAfter: 12, title: '大班课消课', bookingId: 'booking-002', createdAt: at(-5, '18:30') },
    { id: 'credit-003', studentId: 'student-002', type: 'recharge', amount: 4, balanceAfter: 4, title: '体验续费课包', createdAt: at(-9, '14:30') },
    { id: 'credit-004', studentId: 'student-002', type: 'consume', amount: -2, balanceAfter: 2, title: '1 对 2 消课', createdAt: at(-6, '19:30') }
  ],
  growthRecords: [
    { id: 'growth-001', studentId: 'student-001', title: '阶段备注', level: '启蒙班', remark: '正手稳定性较好，反手引拍还需保持动作完整。', createdAt: at(-5, '18:40') },
    { id: 'growth-002', studentId: 'student-002', title: '进阶建议', level: '进阶班', remark: '发球质量提升明显，建议增加接发球判断训练。', createdAt: at(-6, '19:40') },
    { id: 'growth-003', studentId: 'student-003', title: '体验评估', level: '体验课', remark: '协调性好，愿意参与对练，建议从大班启蒙开始。', createdAt: at(-1, '11:20') }
  ],
  messages: [
    { id: 'message-001', guardianId: 'guardian-001', studentId: 'student-001', type: 'booking-success', status: 'unread', title: '预约成功', content: '林一辰已预约今天 18:00 的 1 对 2 课程。', bookingId: 'booking-001', createdAt: at(-1, '09:13') },
    { id: 'message-002', guardianId: 'guardian-001', studentId: 'student-003', type: 'waitlist', status: 'unread', title: '候补成功', content: '林小满已加入明天 10:00 体验课候补，当前排第 1 位。', bookingId: 'booking-003', createdAt: at(-1, '12:11') },
    { id: 'message-003', guardianId: 'guardian-002', studentId: 'student-002', type: 'class-reminder', status: 'unread', title: '课前提醒', content: '陈嘉禾今天 16:00 有 1 对 1 课程，请提前到场。', bookingId: 'booking-004', createdAt: at(0, '10:00') },
    { id: 'message-004', guardianId: 'guardian-001', studentId: 'student-001', type: 'schedule-changed', status: 'read', title: '调课通知', content: '上周大班课已调整至一号球台区，历史记录已同步。', bookingId: 'booking-002', createdAt: at(-6, '15:00') }
  ]
})
