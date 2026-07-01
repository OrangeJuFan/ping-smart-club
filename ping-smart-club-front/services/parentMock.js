import { activeBookingStatuses, parentConfig } from './parent/config'
import {
  clone,
  formatClock,
  formatDateLabel,
  formatTimeRange,
  getDateOptions,
  isSameDate,
  nowIso
} from './parent/date'
import { createInitialStore } from './parent/mockSeed'
import { createId, delay, getStoreSnapshot, mutateStore, readStore, writeStore } from './parent/mockStore'
import {
  addMessage,
  getSessionFromStore,
  getSignInState,
  requireItem,
  resolveBooking,
  resolveSchedule,
  updateScheduleStatus
} from './parent/viewMapper'

const normalizePhone = phone => String(phone || '').trim()

const assertPhone = (phone, message) => {
  if (!parentConfig.phonePattern.test(phone)) throw new Error(message || '请输入正确的手机号')
}

const requireSelectedStudent = (store, selectedStudentId) =>
  requireItem(store.students.find(item => item.id === selectedStudentId), '请先绑定学员')

const api = {
  config: parentConfig,
  getDateOptions,
  formatClock,
  formatDateLabel,
  formatTimeRange,
  getSignInState,
  async resetDemoData() {
    await delay()
    writeStore(createInitialStore())
    return getStoreSnapshot()
  },
  async getSession() {
    await delay()
    return mutateStore(store => getSessionFromStore(store))
  },
  async loginByPhone(phone) {
    await delay()
    const normalized = normalizePhone(phone)
    assertPhone(normalized)

    return mutateStore(store => {
      let guardian = store.guardians.find(item => item.phone === normalized)
      if (!guardian) {
        guardian = {
          id: createId('guardian'),
          name: `家长${normalized.slice(-4)}`,
          phone: normalized,
          relation: '家长'
        }
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
      if (!guardian) throw new Error('暂无可用微信授权账号')
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
    const phone = normalizePhone(payload.phone)
    if (!name) throw new Error('请输入学员姓名')
    assertPhone(phone, '请输入正确的学员手机号')

    return mutateStore(store => {
      const session = getSessionFromStore(store)
      const guardian = requireItem(session.guardian, '请先登录')
      if (session.students.length >= parentConfig.maxBindableStudents) throw new Error('绑定学员数量已达上限')

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
      addMessage(store, {
        guardianId: guardian.id,
        studentId: student.id,
        type: 'bind',
        title: '绑定成功',
        content: `${student.name} 已绑定到当前账号。`
      })
      return getSessionFromStore(store)
    })
  },
  async switchStudent(studentId) {
    await delay()
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      requireItem(session.guardian, '请先登录')
      if (!session.students.some(item => item.id === studentId)) throw new Error('该学员未绑定到当前账号')
      store.selectedStudentId = studentId
      return getSessionFromStore(store)
    })
  },
  async getHomeSummary() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    const guardian = requireItem(session.guardian, '请先登录')
    const student = requireSelectedStudent(store, session.selectedStudentId)
    const bookings = store.bookings.filter(item => item.studentId === student.id).map(item => resolveBooking(store, item))
    const upcomingBookings = bookings
      .filter(item => activeBookingStatuses.indexOf(item.booking.status) >= 0)
      .sort((a, b) => new Date(a.schedule.startTime) - new Date(b.schedule.startTime))
    const recentBookings = bookings.filter(item => item.booking.status === 'completed').slice(0, 3)
    const unreadMessageCount = store.messages.filter(item =>
      item.guardianId === guardian.id &&
      item.status === 'unread' &&
      (!item.studentId || item.studentId === student.id)
    ).length

    return clone({
      student,
      upcomingBookings,
      recentBookings,
      unreadMessageCount,
      creditWarning: student.balance <= parentConfig.lowBalanceThreshold
    })
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
      const student = requireSelectedStudent(store, session.selectedStudentId)
      const schedule = requireItem(store.schedules.find(item => item.id === scheduleId), '课程不存在')
      const courseType = requireItem(store.courseTypes.find(item => item.id === schedule.courseTypeId), '课程类型不存在')
      const existing = store.bookings.find(item =>
        item.studentId === student.id &&
        item.scheduleId === schedule.id &&
        activeBookingStatuses.indexOf(item.status) >= 0
      )
      if (existing) throw new Error('该课程已在预约列表中')
      if (schedule.status === 'closed') throw new Error('该课程已关闭')

      const waitlist = schedule.bookedCount >= schedule.capacity || schedule.status === 'full'
      if (!waitlist && student.balance < courseType.creditCost) {
        throw new Error(`课时余额不足，本课程需 ${courseType.creditCost} 课时`)
      }

      const booking = {
        id: createId('booking'),
        studentId: student.id,
        scheduleId: schedule.id,
        status: waitlist ? 'waitlisted' : 'booked',
        createdAt: nowIso()
      }
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
      const guardian = requireItem(session.guardian, '请先登录')
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
        guardianId: guardian.id,
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
      requireItem(session.guardian, '请先登录')
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
    return clone(store.creditRecords
      .filter(item => item.studentId === session.selectedStudentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  },
  async listGrowthRecords() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    return clone(store.growthRecords
      .filter(item => item.studentId === session.selectedStudentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  },
  async listMessages() {
    await delay()
    const store = readStore()
    const session = getSessionFromStore(store)
    const guardian = requireItem(session.guardian, '请先登录')
    return clone(store.messages
      .filter(item => item.guardianId === guardian.id)
      .filter(item => !item.studentId || item.studentId === session.selectedStudentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  },
  async markMessageRead(messageId) {
    await delay()
    return mutateStore(store => {
      const session = getSessionFromStore(store)
      const guardian = requireItem(session.guardian, '请先登录')
      const message = requireItem(store.messages.find(item =>
        item.id === messageId &&
        item.guardianId === guardian.id &&
        (!item.studentId || item.studentId === session.selectedStudentId)
      ), '消息不存在')
      message.status = 'read'
      return message
    })
  }
}

export default api
