import { assertFound } from '@/api/client';
import { coaches, products, schedules, students } from '@/api/mock-db';
import type { Id } from '@/types/domain';
import { formatDate } from '@/utils/date';

export const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function findStudent(id: Id) {
  return assertFound(students.find((student) => student.id === id), '学员不存在');
}

export function findCoach(id: Id) {
  return assertFound(coaches.find((coach) => coach.id === id), '教练不存在');
}

export function findProduct(id: Id) {
  return assertFound(products.find((product) => product.id === id), '课程产品不存在');
}

export function findSchedule(id: Id) {
  return assertFound(schedules.find((schedule) => schedule.id === id), '课程安排不存在');
}

export function findProductBySchedule(scheduleId: Id) {
  const schedule = findSchedule(scheduleId);
  return findProduct(schedule.productId);
}

export function scheduleDate(scheduleId: Id): string {
  return formatDate(findSchedule(scheduleId).startTime);
}
