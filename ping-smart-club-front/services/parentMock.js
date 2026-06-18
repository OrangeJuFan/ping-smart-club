const STORAGE_KEY = 'ping-smart-club-parent-store-v1'

const config = {
  lowBalanceThreshold: 4,
  mockLatency: 120,
  signInWindow: {
    beforeStartMinutes: 90,
    afterEndMinutes: 120
  },
  maxBindableStudents: 8
}

const pad = value => String(value).padStart(2, '0')

const clone = value => JSON.parse(JSON.stringify(value))

const delay = () => new Promise(resolve => setTimeout(resolve, config.mockLatency))

const addDays = (date, offset) => {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)
  return next
}

const formatDateKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const at = (dayOffset, clock) => {
  const [hours, minutes] = clock.split(':').map(Number)
  const date = addDays(new Date(), dayOffset)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

const nowIso = () => new Date().toISOString()

const createId = prefix => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`

const readStore = () => {
  try {
    const store = uni.getStorageSync(STORAGE_KEY)
    if (store && store.version === 1 && store.generatedDate === formatDateKey(new Date()) && Array.isArray(store.students)) return store
  } catch (error) {
    console.warn('读取家长端缓存失败', error)
  }
  const store = createInitialStore()
  writeStore(store)
  return store
}

const writeStore = store => {
  uni.setStorageSync(STORAGE_KEY, store)
}

const mutateStore = updater => {
  const store = readStore()
  const result = updater(store)
  writeStore(store)
  return clone(result)
}

const requireItem = (item, message) => {
  if (!item) throw new Error(message)
  return item
}

const guardianStudents = (store, guardianId) =>
  store.students.filter(student => student.guardianIds.indexOf(guardianId) >= 0)

const activeBookingStatuses = ['booked', 'waitlisted']

const createInitialStore = () => ({
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
    { id: 'schedule-001', courseTypeId: 'type-001', coachId: 'coach-001', venueId: 'venue-003', startTime: at(0, '16:00'), endTime: at(0, '17:00'), capacity: 1, bookedCount: 1, waitlistCount: 0, status: 'full', note: '反手稳定性专项。' },
    { id: 'schedule-002', courseTypeId: 'type-002', coachId: 'coach-002', venueId: 'venue-001', startTime: at(0, '18:00'), endTime: at(0, '19:15'), capacity: 2, bookedCount: 1, waitlistCount: 0, status: 'open', note: '适合有基础击球经验的学员。' },
    { id: 'schedule-003', courseTypeId: 'type-003', coachId: 'coach-003', venueId: 'venue-002', startTime: at(1, '10:00'), endTime: at(1, '11:00'), capacity: 4, bookedCount: 4, waitlistCount: 2, status: 'full', note: '满员后可加入候补。' },
    { id: 'schedule-004', courseTypeId: 'type-004', coachId: 'coach-003', venueId: 'venue-001', startTime: at(1, '19:00'), endTime: at(1, '20:30'), capacity: 8, bookedCount: 3, waitlistCount: 0, status: 'open', note: '基础步法和多球训练。' },
    { id: 'schedule-005', courseTypeId: 'type-001', coachId: 'coach-002', venueId: 'venue-003', startTime: at(2, '15:00'), endTime: at(2, '16:00'), capacity: 1, bookedCount: 0, waitlistCount: 0, status: 'open', note: '发接发专项提升。' },
    { id: 'schedule-006', courseTypeId: 'type-004', coachId: 'coach-001', venueId: 'venue-001', startTime: at(-5, '17:00'), endTime: at(-5, '18:30'), capacity: 8, bookedCount: 8, waitlistCount: 0, status: 'closed', note: '历史课程。' }
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

const getSessionFromStore = store => {
  const guardian = store.guardians.find(item => item.id === store.currentGuardianId) || null
  const students = guardian ? guardianStudents(store, guardian.id) : []
  const selectedStudentId = students.some(item => item.id === store.selectedStudentId)
    ? store.selectedStudentId
    : (students[0] && students[0].id) || ''
  store.selectedStudentId = selectedStudentId
  return { guardian, students, selectedStudentId }
}

const resolveSchedule = (store, schedule, studentId) => {
  const courseType = requireItem(store.courseTypes.find(item => item.id === schedule.courseTypeId), '课程类型不存在')
  const coach = requireItem(store.coaches.find(item => item.id === schedule.coachId), '教练不存在')
  const venue = requireItem(store.venues.find(item => item.id === schedule.venueId), '场地不存在')
  const activeBooking = store.bookings.find(item =>
    item.studentId === studentId &&
    item.scheduleId === schedule.id &&
    activeBookingStatuses.indexOf(item.status) >= 0
  )
  return {
    schedule,
    courseType,
    coach,
    venue,
    remainingSeats: Math.max(schedule.capacity - schedule.bookedCount, 0),
    isFull: schedule.status === 'full' || schedule.bookedCount >= schedule.capacity,
    hasActiveBooking: !!activeBooking,
    activeBooking
  }
}

const resolveBooking = (store, booking) => {
  const schedule = requireItem(store.schedules.find(item => item.id === booking.scheduleId), '课程不存在')
  const view = resolveSchedule(store, schedule, booking.studentId)
  return Object.assign({}, view, { booking })
}

const addMessage = (store, message) => {
  store.messages.unshift(Object.assign({
    id: createId('message'),
    status: 'unread',
    createdAt: nowIso()
  }, message))
}

const updateScheduleStatus = schedule => {
  if (schedule.status === 'closed') return
  schedule.status = schedule.bookedCount >= schedule.capacity ? 'full' : 'open'
}

const isSameDate = (dateTime, dateKey) => formatDateKey(new Date(dateTime)) === dateKey

const getDateOptions = days => {
  const today = new Date()
  return Array.from({ length: days || 7 }, (_, index) => {
    const date = addDays(today, index)
    return {
      label: index === 0 ? '今天' : index === 1 ? '明天' : `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`,
      value: formatDateKey(date)
    }
  })
}

const formatClock = dateTime => {
  const date = new Date(dateTime)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatDateLabel = dateTime => {
  const date = new Date(dateTime)
  const today = formatDateKey(new Date())
  const tomorrow = formatDateKey(addDays(new Date(), 1))
  const key = formatDateKey(date)
  if (key === today) return '今天'
  if (key === tomorrow) return '明天'
  return `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日`
}

const formatTimeRange = (startTime, endTime) => `${formatDateLabel(startTime)} ${formatClock(startTime)}-${formatClock(endTime)}`

const minutesBetween = (from, to) => Math.round((to.getTime() - from.getTime()) / 60000)

const getSignInState = bookingView => {
  if (!bookingView || bookingView.booking.status !== 'booked') return { visible: false, enabled: false, label: '签到', hint: '' }
  if (bookingView.booking.checkedInAt) return { visible: true, enabled: false, label: '已签到', hint: '签到时间已记录' }
  const now = new Date()
  const start = new Date(bookingView.schedule.startTime)
  const end = new Date(bookingView.schedule.endTime)
  if (formatDateKey(now) !== formatDateKey(start)) return { visible: false, enabled: false, label: '签到', hint: '' }
  const beforeStart = minutesBetween(now, start)
  const afterEnd = minutesBetween(end, now)
  const enabled = beforeStart <= config.signInWindow.beforeStartMinutes && afterEnd <= config.signInWindow.afterEndMinutes
  return {
    visible: true,
    enabled,
    label: enabled ? '签到' : '签到未开放',
    hint: enabled ? '可记录到课时间' : '课程开始前后开放签到'
  }
}

const api = {
  config,
  getDateOptions,
  formatClock,
  formatDateLabel,
  formatTimeRange,
  getSignInState,
  async resetDemoData() {
    await delay()
    const store = createInitialStore()
    writeStore(store)
    return clone(store)
  },
  async getSession() {
    await delay()
    return mutateStore(store => getSessionFromStore(store))
  },
  async loginByPhone(phone) {
    await delay()
    const normalized = String(phone || '').trim()
    if (!/^1[3-9]\d{9}$/.test(normalized)) throw new Error('请输入正确的手机号')
    return mutateStore(store => {
      let guardian = store.guardians.find(item => item.phone === normalized)
      if (!guardian) {
        guardian = { id: createId('guardian'), name: `家长${normalized.slice(-4)}`, phone: normalized, relation: '家长' }
        store.guardians.push(guardian)
      }
      store.currentGuardianId = guardian.id
      return getSessionFromStore(store)
    })
  },
  async loginByWechat(userInfo) {
    await delay()
    return mutateStore(store => {
      const guardian = store.guardians.find(item => item.wechatOpenId === 'wx-lin-mom') || store.guardians[0]
      guardian.name = (userInfo && userInfo.nickName) || guardian.name
      store.currentGuardianId = guardian.id
      return getSessionFromStore(store)
    })
  },
  async logout() {
    await delay()
    return mutateStore(store => {
      store.currentGuardianId = ''
      store.selectedStudentId = ''
      return getSessionFromStore(store)
    })
  },
  async bindStudent(payload) {
    await delay()
    const name = String(payload.name || '').trim()
    const phone = String(payload.phone || '').trim()
    if (!name) throw new Error('请输入学员姓名')
    if (!/^1[3-9]\d{9}$/.test(phone)) throw new Error('请输入正确的学员手机号')
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      const guardian = requireItem(session.guardian, '请先登录')
      if (session.students.length >= config.maxBindableStudents) throw new Error('绑定学员数量已达上限')
      let student = store.students.find(item => item.name === name && item.phone === phone)
      if (!student) {
        student = {
          id: createId('student'),
          name,
          phone,
          age: 8,
          level: '待评估',
          balance: 0,
          guardianIds: [],
          avatarColor: '#475569',
          remark: '新绑定学员，待教练完善成长记录。'
        }
        store.students.push(student)
      }
      if (student.guardianIds.indexOf(guardian.id) < 0) student.guardianIds.push(guardian.id)
      store.selectedStudentId = student.id
      addMessage(store, { guardianId: guardian.id, studentId: student.id, type: 'bind', title: '绑定成功', content: `${student.name} 已绑定到当前账号。` })
      return getSessionFromStore(store)
    })
  },
  async switchStudent(studentId) {
    await delay()
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      if (!session.students.some(item => item.id === studentId)) throw new Error('该学员未绑定到当前账号')
      store.selectedStudentId = studentId
      return getSessionFromStore(store)
    })
  },
  async getHomeSummary() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    const student = requireItem(store.students.find(item => item.id === session.selectedStudentId), '请先绑定学员')
    const bookings = store.bookings.filter(item => item.studentId === student.id).map(item => resolveBooking(store, item))
    const upcomingBookings = bookings
      .filter(item => item.booking.status === 'booked' || item.booking.status === 'waitlisted')
      .sort((a, b) => new Date(a.schedule.startTime) - new Date(b.schedule.startTime))
    const recentBookings = bookings.filter(item => item.booking.status === 'completed').slice(0, 3)
    const unreadMessageCount = store.messages.filter(item =>
      item.guardianId === session.guardian.id &&
      item.status === 'unread' &&
      (!item.studentId || item.studentId === student.id)
    ).length
    return clone({ student, upcomingBookings, recentBookings, unreadMessageCount, creditWarning: student.balance <= config.lowBalanceThreshold })
  },
  async getScheduleMeta() {
    await delay()
    const store = readStore()
    return clone({ courseTypes: store.courseTypes, coaches: store.coaches })
  },
  async listSchedules(filters) {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    const studentId = session.selectedStudentId
    const type = store.courseTypes.find(item => item.code === filters.courseTypeCode)
    return clone(store.schedules
      .filter(item => item.status !== 'closed')
      .filter(item => !filters.date || isSameDate(item.startTime, filters.date))
      .filter(item => !filters.coachId || item.coachId === filters.coachId)
      .filter(item => !type || item.courseTypeId === type.id)
      .map(item => resolveSchedule(store, item, studentId))
      .sort((a, b) => new Date(a.schedule.startTime) - new Date(b.schedule.startTime)))
  },
  async getScheduleDetail(scheduleId) {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    const schedule = requireItem(store.schedules.find(item => item.id === scheduleId), '课程不存在')
    return clone(resolveSchedule(store, schedule, session.selectedStudentId))
  },
  async createBooking(scheduleId) {
    await delay()
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      const guardian = requireItem(session.guardian, '请先登录')
      const student = requireItem(store.students.find(item => item.id === session.selectedStudentId), '请先绑定学员')
      const schedule = requireItem(store.schedules.find(item => item.id === scheduleId), '课程不存在')
      const courseType = requireItem(store.courseTypes.find(item => item.id === schedule.courseTypeId), '课程类型不存在')
      const existing = store.bookings.find(item => item.studentId === student.id && item.scheduleId === schedule.id && activeBookingStatuses.indexOf(item.status) >= 0)
      if (existing) throw new Error('该课程已在预约列表中')
      if (schedule.status === 'closed') throw new Error('该课程已关闭')
      const waitlist = schedule.bookedCount >= schedule.capacity || schedule.status === 'full'
      if (!waitlist && student.balance < courseType.creditCost) throw new Error(`课时余额不足，本课程需 ${courseType.creditCost} 课时`)
      const booking = { id: createId('booking'), studentId: student.id, scheduleId: schedule.id, status: waitlist ? 'waitlisted' : 'booked', createdAt: nowIso() }
      if (waitlist) {
        schedule.waitlistCount += 1
        booking.waitlistRank = schedule.waitlistCount
      } else {
        schedule.bookedCount += 1
        updateScheduleStatus(schedule)
      }
      store.bookings.push(booking)
      addMessage(store, {
        guardianId: guardian.id,
        studentId: student.id,
        type: waitlist ? 'waitlist' : 'booking-success',
        title: waitlist ? '候补成功' : '预约成功',
        content: waitlist ? `${student.name} 已加入 ${courseType.name} 候补。` : `${student.name} 已预约 ${courseType.name}，请按时到场。`,
        bookingId: booking.id
      })
      return resolveBooking(store, booking)
    })
  },
  async cancelBooking(bookingId) {
    await delay()
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      const booking = requireItem(store.bookings.find(item => item.id === bookingId && item.studentId === session.selectedStudentId), '预约不存在')
      if (activeBookingStatuses.indexOf(booking.status) < 0) throw new Error('当前状态不可取消')
      const schedule = requireItem(store.schedules.find(item => item.id === booking.scheduleId), '课程不存在')
      const courseType = requireItem(store.courseTypes.find(item => item.id === schedule.courseTypeId), '课程类型不存在')
      if (booking.status === 'booked') {
        schedule.bookedCount = Math.max(schedule.bookedCount - 1, 0)
        updateScheduleStatus(schedule)
      } else {
        schedule.waitlistCount = Math.max(schedule.waitlistCount - 1, 0)
      }
      booking.status = 'cancelled'
      booking.cancelReason = '用户主动取消'
      addMessage(store, {
        guardianId: session.guardian.id,
        studentId: session.selectedStudentId,
        type: 'booking-cancelled',
        title: '取消预约',
        content: `${courseType.name} 预约已取消。`,
        bookingId: booking.id
      })
      return resolveBooking(store, booking)
    })
  },
  async checkIn(bookingId) {
    await delay()
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      const booking = requireItem(store.bookings.find(item => item.id === bookingId && item.studentId === session.selectedStudentId), '预约不存在')
      const view = resolveBooking(store, booking)
      const state = getSignInState(view)
      if (!state.enabled) throw new Error(state.hint || '当前不可签到')
      booking.checkedInAt = nowIso()
      return resolveBooking(store, booking)
    })
  },
  async listBookings(status) {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    return clone(store.bookings
      .filter(item => item.studentId === session.selectedStudentId)
      .filter(item => !status || status === 'all' || item.status === status)
      .map(item => resolveBooking(store, item))
      .sort((a, b) => new Date(b.schedule.startTime) - new Date(a.schedule.startTime)))
  },
  async listCreditRecords() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    return clone(store.creditRecords.filter(item => item.studentId === session.selectedStudentId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  },
  async listGrowthRecords() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    return clone(store.growthRecords.filter(item => item.studentId === session.selectedStudentId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  },
  async listMessages() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    return clone(store.messages
      .filter(item => item.guardianId === session.guardian.id)
      .filter(item => !item.studentId || item.studentId === session.selectedStudentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  },
  async markMessageRead(messageId) {
    await delay()
    return mutateStore(store => {
      const message = requireItem(store.messages.find(item => item.id === messageId), '消息不存在')
      message.status = 'read'
      return message
    })
  }
}

export default api
