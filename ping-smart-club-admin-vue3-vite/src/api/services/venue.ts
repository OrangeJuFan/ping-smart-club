import { assertFound, clone, mockRequest } from '@/api/client';
import { venues } from '@/api/mock-db';
import { nextId } from '@/api/mock-helpers';
import type { Venue } from '@/types/domain';

export const venueService = {
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
};
