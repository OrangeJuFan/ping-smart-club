import { assertFound, clone, mockRequest } from '@/api/client';
import { attendance, coaches, products, schedules, students } from '@/api/mock-db';
import type { AttendanceStatus, Id } from '@/types/domain';

export const attendanceService = {
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
};
