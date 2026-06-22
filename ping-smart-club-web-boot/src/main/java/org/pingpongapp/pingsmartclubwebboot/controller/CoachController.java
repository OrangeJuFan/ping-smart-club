package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.pojo.Coach;
import org.pingpongapp.pingsmartclubwebboot.pojo.CoachAvailability;
import org.pingpongapp.pingsmartclubwebboot.pojo.CoachLeave;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseSchedule;
import org.pingpongapp.pingsmartclubwebboot.service.CoachService;
import org.pingpongapp.pingsmartclubwebboot.service.ScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "教练管理")
@RestController
@RequestMapping("/admin/coaches")
@RequireRole(AuthRole.ADMIN)
public class CoachController {

    private final CoachService coachService;
    private final ScheduleService scheduleService;

    public CoachController(CoachService coachService, ScheduleService scheduleService) {
        this.coachService = coachService;
        this.scheduleService = scheduleService;
    }

    @Operation(summary = "新增教练")
    @PostMapping
    public ApiResponse<Coach> create(@RequestBody Coach coach) {
        return ApiResponse.ok(coachService.create(coach));
    }

    @Operation(summary = "编辑教练")
    @PutMapping("/{id}")
    public ApiResponse<Coach> update(@PathVariable Long id, @RequestBody Coach coach) {
        return ApiResponse.ok(coachService.update(id, coach));
    }

    @Operation(summary = "禁用教练")
    @PostMapping("/{id}/disable")
    public ApiResponse<Void> disable(@PathVariable Long id) {
        coachService.disable(id);
        return ApiResponse.ok();
    }

    @Operation(summary = "教练详情")
    @GetMapping("/{id}")
    public ApiResponse<Coach> detail(@PathVariable Long id) {
        return ApiResponse.ok(coachService.getById(id));
    }

    @Operation(summary = "教练列表")
    @GetMapping
    public ApiResponse<List<Coach>> list(@RequestParam(required = false) String keyword,
                                         @RequestParam(required = false) String status) {
        return ApiResponse.ok(coachService.list(keyword, status));
    }

    @Operation(summary = "新增教练可授课时间")
    @PostMapping("/{id}/availability")
    public ApiResponse<CoachAvailability> createAvailability(@PathVariable Long id, @RequestBody CoachAvailability availability) {
        return ApiResponse.ok(coachService.createAvailability(id, availability));
    }

    @Operation(summary = "教练可授课时间")
    @GetMapping("/{id}/availability")
    public ApiResponse<List<CoachAvailability>> availability(@PathVariable Long id) {
        return ApiResponse.ok(coachService.listAvailability(id));
    }

    @Operation(summary = "删除教练可授课时间")
    @DeleteMapping("/availability/{availabilityId}")
    public ApiResponse<Void> deleteAvailability(@PathVariable Long availabilityId) {
        coachService.deleteAvailability(availabilityId);
        return ApiResponse.ok();
    }

    @Operation(summary = "新增教练请假")
    @PostMapping("/{id}/leaves")
    public ApiResponse<CoachLeave> createLeave(@PathVariable Long id, @RequestBody CoachLeave leave) {
        return ApiResponse.ok(coachService.createLeave(id, leave));
    }

    @Operation(summary = "教练请假记录")
    @GetMapping("/{id}/leaves")
    public ApiResponse<List<CoachLeave>> leaves(@PathVariable Long id) {
        return ApiResponse.ok(coachService.listLeaves(id));
    }

    @Operation(summary = "教练课表")
    @GetMapping("/{id}/schedules")
    public ApiResponse<List<CourseSchedule>> schedules(@PathVariable Long id) {
        return ApiResponse.ok(scheduleService.list(null, id, null, null));
    }
}
