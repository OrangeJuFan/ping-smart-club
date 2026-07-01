import { assertFound, clone, mockRequest } from '@/api/client';
import { bookings, coaches, notifications, products, schedules, students, venues } from '@/api/mock-db';
import { findCoach, findProduct, findSchedule, nextId } from '@/api/mock-helpers';
import type { Id, Schedule } from '@/types/domain';

export const scheduleService = {
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
};
