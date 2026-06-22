package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.dto.AttendanceDtos;
import org.pingpongapp.pingsmartclubwebboot.pojo.AttendanceRecord;
import org.pingpongapp.pingsmartclubwebboot.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "考勤管理")
@RestController
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Operation(summary = "教练签到")
    @PostMapping("/coach/attendance/sign-in")
    @RequireRole({AuthRole.COACH, AuthRole.ADMIN})
    public ApiResponse<AttendanceRecord> coachSignIn(@RequestBody AttendanceDtos.SignInRequest request) {
        return ApiResponse.ok(attendanceService.signIn("COACH", request));
    }

    @Operation(summary = "学员签到")
    @PostMapping("/miniapp/attendance/student-sign-in")
    @RequireRole({AuthRole.STUDENT_PARENT, AuthRole.ADMIN})
    public ApiResponse<AttendanceRecord> studentSignIn(@RequestBody AttendanceDtos.SignInRequest request) {
        return ApiResponse.ok(attendanceService.signIn("STUDENT", request));
    }

    @Operation(summary = "后台确认到课/旷课/请假")
    @PostMapping("/admin/attendance/confirm")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<AttendanceRecord> confirm(@RequestBody AttendanceDtos.ConfirmAttendanceRequest request) {
        return ApiResponse.ok(attendanceService.confirm(request));
    }

    @Operation(summary = "考勤记录查询")
    @GetMapping("/admin/attendance")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<List<AttendanceRecord>> list(@RequestParam(required = false) Long scheduleId,
                                                    @RequestParam(required = false) Long personId,
                                                    @RequestParam(required = false) String personType) {
        return ApiResponse.ok(attendanceService.list(scheduleId, personId, personType));
    }
}
