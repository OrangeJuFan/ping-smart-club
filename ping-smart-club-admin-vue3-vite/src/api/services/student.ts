import { assertFound, clone, mockRequest } from '@/api/client';
import { notifications, students } from '@/api/mock-db';
import { findStudent, nextId } from '@/api/mock-helpers';
import type { Id, Student } from '@/types/domain';

export const studentService = {
  getStudents() {
    return mockRequest(() => clone(students));
  },

  saveStudent(payload: Omit<Student, 'id' | 'createdAt'> & Partial<Pick<Student, 'id' | 'createdAt'>>) {
    return mockRequest(() => {
      if (payload.id) {
        const index = students.findIndex((item) => item.id === payload.id);
        assertFound(students[index], '学员不存在');
        students[index] = { ...students[index], ...payload } as Student;
        return clone(students[index]);
      }

      const student: Student = {
        ...payload,
        id: nextId('stu'),
        createdAt: new Date().toISOString(),
      };
      students.unshift(student);
      return clone(student);
    }, '保存成功');
  },

  adjustStudentBalance(studentId: Id, delta: number, remark: string) {
    return mockRequest(() => {
      const student = findStudent(studentId);
      student.balance = Math.max(0, student.balance + delta);
      notifications.unshift({
        id: nextId('msg'),
        type: '预约成功',
        receiver: student.guardian.name,
        channel: '系统',
        content: `${student.name}课时调整 ${delta > 0 ? '+' : ''}${delta}，原因：${remark || '后台调整'}`,
        relatedId: student.id,
        status: 'sent',
        createdAt: new Date().toISOString(),
      });
      return clone(student);
    }, '课时已调整');
  },
};
