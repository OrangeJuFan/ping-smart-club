import { assertFound, clone, mockRequest } from '@/api/client';
import { coaches } from '@/api/mock-db';
import { nextId } from '@/api/mock-helpers';
import type { Coach } from '@/types/domain';

export const coachService = {
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
};
