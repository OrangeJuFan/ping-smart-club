package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.mapper.AppUserMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.StudentMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.AppUser;
import org.pingpongapp.pingsmartclubwebboot.pojo.Student;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class StudentService {

    private final StudentMapper studentMapper;
    private final AppUserMapper appUserMapper;
    private final LessonAccountService lessonAccountService;

    public StudentService(StudentMapper studentMapper, AppUserMapper appUserMapper, LessonAccountService lessonAccountService) {
        this.studentMapper = studentMapper;
        this.appUserMapper = appUserMapper;
        this.lessonAccountService = lessonAccountService;
    }

    public Student create(Student student) {
        if (!StringUtils.hasText(student.getName())) {
            throw BusinessException.badRequest("学员姓名不能为空");
        }
        if (!StringUtils.hasText(student.getStatus())) {
            student.setStatus("ACTIVE");
        }
        studentMapper.insert(student);
        lessonAccountService.ensureAccount(student.getId());
        createLoginUserIfAbsent(student);
        return student;
    }

    public Student update(Long id, Student student) {
        getById(id);
        student.setId(id);
        studentMapper.updateById(student);
        return getById(id);
    }

    public void disable(Long id) {
        Student student = getById(id);
        student.setStatus("DISABLED");
        studentMapper.updateById(student);
        disableLoginUsers(id, "STUDENT_PARENT");
    }

    public Student getById(Long id) {
        Student student = studentMapper.selectById(id);
        if (student == null) {
            throw BusinessException.notFound("学员不存在");
        }
        return student;
    }

    public List<Student> list(String keyword, String status) {
        LambdaQueryWrapper<Student> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(StringUtils.hasText(keyword), w -> w
            .like(Student::getName, keyword)
            .or()
            .like(Student::getPhone, keyword)
            .or()
            .like(Student::getParentPhone, keyword));
        wrapper.eq(StringUtils.hasText(status), Student::getStatus, status);
        wrapper.orderByDesc(Student::getId);
        return studentMapper.selectList(wrapper);
    }

    private void createLoginUserIfAbsent(Student student) {
        String loginPhone = StringUtils.hasText(student.getParentPhone()) ? student.getParentPhone() : student.getPhone();
        if (!StringUtils.hasText(loginPhone)) {
            return;
        }
        Long count = appUserMapper.selectCount(new LambdaQueryWrapper<AppUser>()
            .eq(AppUser::getRole, "STUDENT_PARENT")
            .eq(AppUser::getPhone, loginPhone));
        if (count > 0) {
            return;
        }
        AppUser user = new AppUser();
        user.setUsername("student_" + student.getId());
        user.setPhone(loginPhone);
        user.setPassword("123456");
        user.setRole("STUDENT_PARENT");
        user.setRelatedId(student.getId());
        user.setDisplayName(student.getName());
        user.setStatus("ACTIVE");
        appUserMapper.insert(user);
    }

    private void disableLoginUsers(Long relatedId, String role) {
        List<AppUser> users = appUserMapper.selectList(new LambdaQueryWrapper<AppUser>()
            .eq(AppUser::getRole, role)
            .eq(AppUser::getRelatedId, relatedId));
        users.forEach(user -> {
            user.setStatus("DISABLED");
            appUserMapper.updateById(user);
        });
    }
}
