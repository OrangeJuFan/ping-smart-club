import { assertFound, clone, mockRequest } from '@/api/client';
import { bookings, coaches, products, schedules, students } from '@/api/mock-db';
import { findSchedule } from '@/api/mock-helpers';
import type { BookingStatus, Id } from '@/types/domain';

export const bookingService = {
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
};
