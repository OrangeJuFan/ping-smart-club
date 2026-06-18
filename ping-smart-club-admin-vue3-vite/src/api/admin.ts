import { assertFound, clone, mockRequest } from '@/api/client';
import {
  attendance,
  bookings,
  coaches,
  courseTypes,
  notifications,
  products,
  schedules,
  students,
  venues,
} from '@/api/mock-db';
import { appConfig } from '@/config/app';
import type {
  AttendanceStatus,
  BookingStatus,
  Coach,
  CourseProduct,
  CourseType,
  DashboardMetrics,
  Id,
  Schedule,
  Student,
  Venue,
} from '@/types/domain';
import { formatDate, formatDateTime, sameDate } from '@/utils/date';

const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const adminApi = {
  getDashboard() {
    return mockRequest<DashboardMetrics>(() => {
      const todaySchedules = schedules.filter((schedule) => sameDate(schedule.startTime, new Date()));
      const todayScheduleIds = new Set(todaySchedules.map((schedule) => schedule.id));
      const todayBookings = bookings.filter(
        (booking) => todayScheduleIds.has(booking.scheduleId) && booking.status !== 'canceled',
      );
      const checkedIn = attendance.filter(
        (item) => todayScheduleIds.has(item.scheduleId) && item.status === 'present',
      );
      const lowBalance = students.filter((student) => student.balance < appConfig.lowBalanceThreshold);

      return {
        todayCourseCount: todaySchedules.length,
        todayBookingCount: todayBookings.length,
        todayPendingClassCount: todaySchedules.filter((schedule) => schedule.status === 'scheduled').length,
        todayCheckedInCount: checkedIn.length,
        lowBalanceStudentCount: lowBalance.length,
        reminders: [
          ...bookings
            .filter((booking) => booking.status === 'canceled')
            .map((booking) => ({
              id: booking.id,
              title: '取消预约',
              content: `${findStudent(booking.studentId).name} 取消了 ${findProductBySchedule(booking.scheduleId).name}`,
              time: formatDateTime(booking.createdAt),
            })),
          ...bookings
            .filter((booking) => booking.status === 'waitlisted')
            .map((booking) => ({
              id: booking.id,
              title: '候补提醒',
              content: `${findStudent(booking.studentId).name} 正在候补 ${findProductBySchedule(booking.scheduleId).name}`,
              time: formatDateTime(booking.createdAt),
            })),
        ].slice(0, 6),
      };
    });
  },

  getStudents() {
    return mockRequest(() => clone(students));
  },

  saveStudent(payload: Omit<Student, 'id' | 'createdAt'> & Partial<Pick<Student, 'id' | 'createdAt'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = students.findIndex((item) => item.id === payload.id);
        assertFound(students[index], '学员不存在');
        students[index] = { ...students[index], ...payload } as Student;
        return clone(students[index]);
      }

      const student: Student = {
        ...payload,
        id: nextId('stu'),
        createdAt: new Date().toISOString(),
      };
      students.unshift(student);
      return clone(student);
    }, '保存成功');
  },

  adjustStudentBalance(studentId: Id, delta: number, remark: string) {
    return mockRequest(() => {
      const student = findStudent(studentId);
      student.balance = Math.max(0, student.balance + delta);
      notifications.unshift({
        id: nextId('msg'),
        type: '预约成功',
        receiver: student.guardian.name,
        channel: '系统',
        content: `${student.name}课时调整 ${delta > 0 ? '+' : ''}${delta}，原因：${remark || '后台调整'}`,
        relatedId: student.id,
        status: 'sent',
        createdAt: new Date().toISOString(),
      });
      return clone(student);
    }, '课时已调整');
  },

  getCoaches() {
    return mockRequest(() => clone(coaches));
  },

  saveCoach(payload: Omit<Coach, 'id'> & Partial<Pick<Coach, 'id'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = coaches.findIndex((item) => item.id === payload.id);
        assertFound(coaches[index], '教练不存在');
        coaches[index] = { ...coaches[index], ...payload } as Coach;
        return clone(coaches[index]);
      }

      const coach: Coach = { ...payload, id: nextId('coach') };
      coaches.unshift(coach);
      return clone(coach);
    }, '保存成功');
  },

  getCourses() {
    return mockRequest(() => ({
      types: clone(courseTypes),
      products: clone(products),
    }));
  },

  saveCourseType(payload: Omit<CourseType, 'id'> & Partial<Pick<CourseType, 'id'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = courseTypes.findIndex((item) => item.id === payload.id);
        assertFound(courseTypes[index], '课程类型不存在');
        courseTypes[index] = { ...courseTypes[index], ...payload } as CourseType;
        return clone(courseTypes[index]);
      }

      const courseType: CourseType = { ...payload, id: nextId('type') };
      courseTypes.unshift(courseType);
      return clone(courseType);
    }, '保存成功');
  },

  saveCourseProduct(payload: Omit<CourseProduct, 'id'> & Partial<Pick<CourseProduct, 'id'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = products.findIndex((item) => item.id === payload.id);
        assertFound(products[index], '课程产品不存在');
        products[index] = { ...products[index], ...payload } as CourseProduct;
        return clone(products[index]);
      }

      const product: CourseProduct = { ...payload, id: nextId('prod') };
      products.unshift(product);
      return clone(product);
    }, '保存成功');
  },

  getVenues() {
    return mockRequest(() => clone(venues));
  },

  saveVenue(payload: Omit<Venue, 'id'> & Partial<Pick<Venue, 'id'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = venues.findIndex((item) => item.id === payload.id);
        assertFound(venues[index], '场地不存在');
        venues[index] = { ...venues[index], ...payload } as Venue;
        return clone(venues[index]);
      }

      const venue: Venue = { ...payload, id: nextId('venue') };
      venues.unshift(venue);
      return clone(venue);
    }, '保存成功');
  },

  getSchedules() {
    return mockRequest(() => ({
      schedules: clone(schedules),
      bookings: clone(bookings),
      students: clone(students),
      coaches: clone(coaches),
      products: clone(products),
      venues: clone(venues),
    }));
  },

  saveSchedule(payload: Omit<Schedule, 'id' | 'bookedCount' | 'waitlistCount'> & Partial<Schedule>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = schedules.findIndex((item) => item.id === payload.id);
        assertFound(schedules[index], '课程安排不存在');
        schedules[index] = { ...schedules[index], ...payload } as Schedule;
        return clone(schedules[index]);
      }

      const schedule: Schedule = {
        ...payload,
        id: nextId('sch'),
        bookedCount: 0,
        waitlistCount: 0,
      } as Schedule;
      schedules.unshift(schedule);
      return clone(schedule);
    }, '保存成功');
  },

  cancelSchedule(scheduleId: Id) {
    return mockRequest(() => {
      const schedule = findSchedule(scheduleId);
      schedule.status = 'canceled';
      bookings
        .filter((booking) => booking.scheduleId === scheduleId && booking.status === 'booked')
        .forEach((booking) => {
          booking.status = 'canceled';
          booking.cancelReason = '后台取消课程';
        });
      return clone(schedule);
    }, '课程已取消');
  },

  swapCoach(scheduleId: Id, coachId: Id) {
    return mockRequest(() => {
      const schedule = findSchedule(scheduleId);
      schedule.coachId = coachId;
      notifications.unshift({
        id: nextId('msg'),
        type: '调课通知',
        receiver: '已预约学员',
        channel: '系统',
        content: `${findProduct(schedule.productId).name} 已更换教练为 ${findCoach(coachId).name}`,
        relatedId: scheduleId,
        status: 'sent',
        createdAt: new Date().toISOString(),
      });
      return clone(schedule);
    }, '教练已调换');
  },

  getBookings() {
    return mockRequest(() => ({
      bookings: clone(bookings),
      schedules: clone(schedules),
      students: clone(students),
      products: clone(products),
      coaches: clone(coaches),
    }));
  },

  updateBookingStatus(bookingId: Id, status: BookingStatus, cancelReason?: string) {
    return mockRequest(() => {
      const booking = assertFound(bookings.find((item) => item.id === bookingId), '预约记录不存在');
      booking.status = status;
      booking.cancelReason = cancelReason;
      return clone(booking);
    }, '预约状态已更新');
  },

  promoteWaitlist(bookingId: Id) {
    return mockRequest(() => {
      const booking = assertFound(bookings.find((item) => item.id === bookingId), '候补记录不存在');
      booking.status = 'booked';
      const schedule = findSchedule(booking.scheduleId);
      schedule.bookedCount += 1;
      schedule.waitlistCount = Math.max(0, schedule.waitlistCount - 1);
      return clone(booking);
    }, '候补已转正');
  },

  getAttendance() {
    return mockRequest(() => ({
      attendance: clone(attendance),
      schedules: clone(schedules),
      students: clone(students),
      coaches: clone(coaches),
      products: clone(products),
    }));
  },

  markAttendance(id: Id, status: AttendanceStatus) {
    return mockRequest(() => {
      const item = assertFound(attendance.find((row) => row.id === id), '考勤记录不存在');
      item.status = status;
      item.checkedAt = status === 'scheduled' ? undefined : new Date().toISOString();
      return clone(item);
    }, '考勤已更新');
  },

  getNotifications() {
    return mockRequest(() => clone(notifications));
  },
};

function findStudent(id: Id) {
  return assertFound(students.find((student) => student.id === id), '学员不存在');
}

function findCoach(id: Id) {
  return assertFound(coaches.find((coach) => coach.id === id), '教练不存在');
}

function findProduct(id: Id) {
  return assertFound(products.find((product) => product.id === id), '课程产品不存在');
}

function findSchedule(id: Id) {
  return assertFound(schedules.find((schedule) => schedule.id === id), '课程安排不存在');
}

function findProductBySchedule(scheduleId: Id) {
  const schedule = findSchedule(scheduleId);
  return findProduct(schedule.productId);
}

export function scheduleDate(scheduleId: Id): string {
  return formatDate(findSchedule(scheduleId).startTime);
}
