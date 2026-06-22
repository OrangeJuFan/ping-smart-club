package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.pojo.AttendanceRecord;
import org.pingpongapp.pingsmartclubwebboot.pojo.Booking;
import org.pingpongapp.pingsmartclubwebboot.pojo.Student;
import org.pingpongapp.pingsmartclubwebboot.service.AttendanceService;
import org.pingpongapp.pingsmartclubwebboot.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "学员管理")
@RestController
@RequestMapping("/admin/students")
@RequireRole({AuthRole.ADMIN, AuthRole.COACH})
public class StudentController {

    private final StudentService studentService;
    private final AttendanceService attendanceService;

    public StudentController(StudentService studentService, AttendanceService attendanceService) {
        this.studentService = studentService;
        this.attendanceService = attendanceService;
    }

    @Operation(summary = "新增学员")
    @PostMapping
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<Student> create(@RequestBody Student student) {
        return ApiResponse.ok(studentService.create(student));
    }

    @Operation(summary = "编辑学员")
    @PutMapping("/{id}")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<Student> update(@PathVariable Long id, @RequestBody Student student) {
        return ApiResponse.ok(studentService.update(id, student));
    }

    @Operation(summary = "禁用学员")
    @PostMapping("/{id}/disable")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<Void> disable(@PathVariable Long id) {
        studentService.disable(id);
        return ApiResponse.ok();
    }

    @Operation(summary = "学员详情")
    @GetMapping("/{id}")
    public ApiResponse<Student> detail(@PathVariable Long id) {
        return ApiResponse.ok(studentService.getById(id));
    }

    @Operation(summary = "学员列表")
    @GetMapping
    public ApiResponse<List<Student>> list(@RequestParam(required = false) String keyword,
                                           @RequestParam(required = false) String status) {
        return ApiResponse.ok(studentService.list(keyword, status));
    }

    @Operation(summary = "学员课程记录")
    @GetMapping("/{id}/course-records")
    public ApiResponse<List<Booking>> courseRecords(@PathVariable Long id) {
        return ApiResponse.ok(attendanceService.listCourseRecords(id));
    }

    @Operation(summary = "学员考勤记录")
    @GetMapping("/{id}/attendance-records")
    public ApiResponse<List<AttendanceRecord>> attendanceRecords(@PathVariable Long id) {
        return ApiResponse.ok(attendanceService.listByStudent(id));
    }
}
