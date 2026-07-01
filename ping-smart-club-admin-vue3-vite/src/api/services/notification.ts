import { clone, mockRequest } from '@/api/client';
import { notifications } from '@/api/mock-db';

export const notificationService = {
  getNotifications() {
    return mockRequest(() => clone(notifications));
  },
};
