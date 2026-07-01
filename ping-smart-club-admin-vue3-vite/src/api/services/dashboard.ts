import { clone, mockRequest } from '@/api/client';
import { attendance, bookings, schedules, students } from '@/api/mock-db';
import { findProductBySchedule, findStudent } from '@/api/mock-helpers';
import { appConfig } from '@/config/app';
import type { DashboardMetrics } from '@/types/domain';
import { formatDateTime, sameDate } from '@/utils/date';

export const dashboardService = {
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

      return clone({
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
      });
    });
  },
};
