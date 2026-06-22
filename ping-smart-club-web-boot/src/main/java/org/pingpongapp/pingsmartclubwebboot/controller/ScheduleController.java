package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.dto.ScheduleDtos;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseSchedule;
import org.pingpongapp.pingsmartclubwebboot.service.ScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "排课管理")
@RestController
@RequestMapping("/admin/schedules")
@RequireRole(AuthRole.ADMIN)
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @Operation(summary = "后台创建课程安排")
    @PostMapping
    public ApiResponse<CourseSchedule> create(@RequestBody CourseSchedule schedule) {
        return ApiResponse.ok(scheduleService.create(schedule));
    }

    @Operation(summary = "编辑课程安排")
    @PutMapping("/{id}")
    public ApiResponse<CourseSchedule> update(@PathVariable Long id, @RequestBody CourseSchedule schedule) {
        return ApiResponse.ok(scheduleService.update(id, schedule));
    }

    @Operation(summary = "取消课程安排")
    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancel(@PathVariable Long id) {
        scheduleService.cancel(id);
        return ApiResponse.ok();
    }

    @Operation(summary = "调换教练")
    @PostMapping("/{id}/change-coach")
    public ApiResponse<CourseSchedule> changeCoach(@PathVariable Long id, @RequestBody ScheduleDtos.ChangeCoachRequest request) {
        return ApiResponse.ok(scheduleService.changeCoach(id, request.coachId()));
    }

    @Operation(summary = "课程安排详情")
    @GetMapping("/{id}")
    public ApiResponse<CourseSchedule> detail(@PathVariable Long id) {
        return ApiResponse.ok(scheduleService.getById(id));
    }

    @Operation(summary = "课表查询")
    @GetMapping
    public ApiResponse<List<CourseSchedule>> list(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                  @RequestParam(required = false) Long coachId,
                                                  @RequestParam(required = false) Long venueId,
                                                  @RequestParam(required = false) String status) {
        return ApiResponse.ok(scheduleService.list(date, coachId, venueId, status));
    }
}
