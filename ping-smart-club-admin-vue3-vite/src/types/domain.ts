export type Id = string;

export type EntityStatus = 'active' | 'inactive';
export type ProductStatus = 'online' | 'offline';
export type BookingStatus = 'booked' | 'waitlisted' | 'canceled' | 'consumed';
export type ScheduleStatus = 'scheduled' | 'teaching' | 'finished' | 'canceled';
export type AttendanceStatus = 'scheduled' | 'present' | 'absent' | 'leave';
export type NotificationStatus = 'sent' | 'failed';

export interface Guardian {
  name: string;
  relation: string;
  phone: string;
  wechat?: string;
}

export interface Student {
  id: Id;
  name: string;
  phone: string;
  age: number;
  level: string;
  balance: number;
  guardian: Guardian;
  status: EntityStatus;
  remark?: string;
  createdAt: string;
}

export interface Coach {
  id: Id;
  name: string;
  phone: string;
  title: string;
  courseTypes: string[];
  certifications: string[];
  availableTimes: string[];
  leaveDates: string[];
  status: EntityStatus;
}

export interface CourseType {
  id: Id;
  name: string;
  description: string;
  status: EntityStatus;
}

export interface CourseProduct {
  id: Id;
  typeId: Id;
  name: string;
  capacity: number;
  price: number;
  creditCost: number;
  durationMinutes: number;
  status: ProductStatus;
}

export interface Venue {
  id: Id;
  name: string;
  area: string;
  capacity: number;
  status: EntityStatus;
  remark?: string;
}

export interface Schedule {
  id: Id;
  productId: Id;
  coachId: Id;
  venueId: Id;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  status: ScheduleStatus;
}

export interface Booking {
  id: Id;
  studentId: Id;
  scheduleId: Id;
  status: BookingStatus;
  createdAt: string;
  cancelReason?: string;
}

export interface Attendance {
  id: Id;
  scheduleId: Id;
  studentId?: Id;
  coachId?: Id;
  role: 'student' | 'coach';
  status: AttendanceStatus;
  checkedAt?: string;
  remark?: string;
}

export interface NotificationLog {
  id: Id;
  type: '预约成功' | '取消通知' | '调课通知' | '课前提醒' | '候补提醒';
  receiver: string;
  channel: '短信' | '微信' | '系统';
  content: string;
  relatedId?: Id;
  status: NotificationStatus;
  createdAt: string;
}

export interface DashboardMetrics {
  todayCourseCount: number;
  todayBookingCount: number;
  todayPendingClassCount: number;
  todayCheckedInCount: number;
  lowBalanceStudentCount: number;
  reminders: Array<{
    id: Id;
    title: string;
    content: string;
    time: string;
  }>;
}

export interface OptionItem {
  label: string;
  value: string;
}
