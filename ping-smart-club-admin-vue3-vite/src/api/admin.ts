import { attendanceService } from '@/api/services/attendance';
import { bookingService } from '@/api/services/booking';
import { coachService } from '@/api/services/coach';
import { courseService } from '@/api/services/course';
import { dashboardService } from '@/api/services/dashboard';
import { notificationService } from '@/api/services/notification';
import { scheduleService } from '@/api/services/schedule';
import { studentService } from '@/api/services/student';
import { venueService } from '@/api/services/venue';

export const adminApi = {
  ...dashboardService,
  ...studentService,
  ...coachService,
  ...courseService,
  ...venueService,
  ...scheduleService,
  ...bookingService,
  ...attendanceService,
  ...notificationService,
};

export { scheduleDate } from '@/api/mock-helpers';
