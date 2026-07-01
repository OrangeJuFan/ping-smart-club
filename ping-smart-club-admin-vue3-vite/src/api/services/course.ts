import { assertFound, clone, mockRequest } from '@/api/client';
import { courseTypes, products } from '@/api/mock-db';
import { nextId } from '@/api/mock-helpers';
import type { CourseProduct, CourseType } from '@/types/domain';

export const courseService = {
  getCourses() {
    return mockRequest(() => ({
      types: clone(courseTypes),
      products: clone(products),
    }));
  },

  saveCourseType(payload: Omit<CourseType, 'id'> & Partial<Pick<CourseType, 'id'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = courseTypes.findIndex((item) => item.id === payload.id);
        assertFound(courseTypes[index], '课程类型不存在');
        courseTypes[index] = { ...courseTypes[index], ...payload } as CourseType;
        return clone(courseTypes[index]);
      }

      const courseType: CourseType = { ...payload, id: nextId('type') };
      courseTypes.unshift(courseType);
      return clone(courseType);
    }, '保存成功');
  },

  saveCourseProduct(payload: Omit<CourseProduct, 'id'> & Partial<Pick<CourseProduct, 'id'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = products.findIndex((item) => item.id === payload.id);
        assertFound(products[index], '课程产品不存在');
        products[index] = { ...products[index], ...payload } as CourseProduct;
        return clone(products[index]);
      }

      const product: CourseProduct = { ...payload, id: nextId('prod') };
      products.unshift(product);
      return clone(product);
    }, '保存成功');
  },
};
