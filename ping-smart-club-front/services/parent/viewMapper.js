import { activeBookingStatuses, parentConfig } from './config'
import { createId } from './mockStore'
import { formatDateKey, minutesBetween, nowIso } from './date'

export const requireItem = (item, message) => {
  if (!item) throw new Error(message)
  return item
}

export const guardianStudents = (store, guardianId) =>
  store.students.filter(student => student.guardianIds.indexOf(guardianId) >= 0)

export const getSessionFromStore = store => {
  const guardian = store.guardians.find(item => item.id === store.currentGuardianId) || null
  const students = guardian ? guardianStudents(store, guardian.id) : []
  const selectedStudentId = students.some(item => item.id === store.selectedStudentId)
    ? store.selectedStudentId
    : (students[0] && students[0].id) || ''

  store.selectedStudentId = selectedStudentId
  return { guardian, students, selectedStudentId }
}

export const resolveSchedule = (store, schedule, studentId) => {
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

export const resolveBooking = (store, booking) => {
  const schedule = requireItem(store.schedules.find(item => item.id === booking.scheduleId), '课程不存在')
  const view = resolveSchedule(store, schedule, booking.studentId)
  return Object.assign({}, view, { booking })
}

export const addMessage = (store, message) => {
  store.messages.unshift(Object.assign({
    id: createId('message'),
    status: 'unread',
    createdAt: nowIso()
  }, message))
}

export const updateScheduleStatus = schedule => {
  if (schedule.status === 'closed') return
  schedule.status = schedule.bookedCount >= schedule.capacity ? 'full' : 'open'
}

export const getSignInState = bookingView => {
  if (!bookingView || bookingView.booking.status !== 'booked') {
    return { visible: false, enabled: false, label: '签到', hint: '' }
  }
  if (bookingView.booking.checkedInAt) {
    return { visible: true, enabled: false, label: '已签到', hint: '签到时间已记录' }
  }

  const now = new Date()
  const start = new Date(bookingView.schedule.startTime)
  const end = new Date(bookingView.schedule.endTime)
  if (formatDateKey(now) !== formatDateKey(start)) {
    return { visible: false, enabled: false, label: '签到', hint: '' }
  }

  const beforeStart = minutesBetween(now, start)
  const afterEnd = minutesBetween(end, now)
  const enabled =
    beforeStart <= parentConfig.signInWindow.beforeStartMinutes &&
    afterEnd <= parentConfig.signInWindow.afterEndMinutes

  return {
    visible: true,
    enabled,
    label: enabled ? '签到' : '签到未开放',
    hint: enabled ? '可记录到课时间' : '课程开始前后开放签到'
  }
}
