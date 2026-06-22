package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthContext;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.dto.BookingDtos;
import org.pingpongapp.pingsmartclubwebboot.pojo.Booking;
import org.pingpongapp.pingsmartclubwebboot.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "预约与候补")
@RestController
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Operation(summary = "小程序/App 查询可预约课程")
    @GetMapping("/miniapp/schedules/available")
    @RequireRole({AuthRole.STUDENT_PARENT, AuthRole.ADMIN})
    public ApiResponse<List<BookingDtos.AvailableScheduleResponse>> availableSchedules() {
        return ApiResponse.ok(bookingService.listAvailable());
    }

    @Operation(summary = "学员创建预约")
    @PostMapping("/miniapp/bookings")
    @RequireRole({AuthRole.STUDENT_PARENT, AuthRole.ADMIN})
    public ApiResponse<Booking> createBooking(@RequestBody BookingDtos.CreateBookingRequest request) {
        Long studentId = resolveStudentId(request.studentId());
        return ApiResponse.ok(bookingService.createBooking(request.scheduleId(), studentId, "STUDENT", request.remark()));
    }

    @Operation(summary = "学员取消预约")
    @PostMapping("/miniapp/bookings/{id}/cancel")
    @RequireRole({AuthRole.STUDENT_PARENT, AuthRole.ADMIN})
    public ApiResponse<Booking> cancelBooking(@PathVariable Long id, @RequestBody(required = false) BookingDtos.CancelBookingRequest request) {
        String reason = request == null ? "学员取消" : request.reason();
        return ApiResponse.ok(bookingService.cancel(id, reason));
    }

    @Operation(summary = "加入候补队列")
    @PostMapping("/miniapp/schedules/{scheduleId}/waitlist")
    @RequireRole({AuthRole.STUDENT_PARENT, AuthRole.ADMIN})
    public ApiResponse<Booking> joinWaitlist(@PathVariable Long scheduleId, @RequestBody BookingDtos.CreateBookingRequest request) {
        Long studentId = resolveStudentId(request.studentId());
        return ApiResponse.ok(bookingService.joinWaitlist(scheduleId, studentId, "STUDENT", request.remark()));
    }

    @Operation(summary = "后台预约列表")
    @GetMapping("/admin/bookings")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<List<Booking>> adminList(@RequestParam(required = false) Long studentId,
                                                @RequestParam(required = false) Long scheduleId,
                                                @RequestParam(required = false) String status) {
        return ApiResponse.ok(bookingService.list(studentId, scheduleId, status));
    }

    @Operation(summary = "管理员取消预约")
    @PostMapping("/admin/bookings/{id}/cancel")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<Booking> adminCancel(@PathVariable Long id, @RequestBody(required = false) BookingDtos.CancelBookingRequest request) {
        String reason = request == null ? "后台取消" : request.reason();
        return ApiResponse.ok(bookingService.cancel(id, reason));
    }

    @Operation(summary = "管理员确认消课")
    @PostMapping("/admin/bookings/{id}/complete")
    @RequireRole(AuthRole.ADMIN)
    public ApiResponse<Booking> adminComplete(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.complete(id, "后台确认上课完成"));
    }

    @Operation(summary = "教练代学员消课")
    @PostMapping("/coach/bookings/{id}/complete")
    @RequireRole({AuthRole.COACH, AuthRole.ADMIN})
    public ApiResponse<Booking> coachComplete(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.complete(id, "教练确认上课完成"));
    }

    private Long resolveStudentId(Long requestStudentId) {
        Long relatedId = AuthContext.getUser().getRelatedId();
        return relatedId == null ? requestStudentId : relatedId;
    }
}
