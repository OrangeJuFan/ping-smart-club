package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.pojo.NotificationRecord;
import org.pingpongapp.pingsmartclubwebboot.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "通知记录")
@RestController
@RequestMapping("/admin/notifications")
@RequireRole(AuthRole.ADMIN)
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "新增通知记录")
    @PostMapping
    public ApiResponse<NotificationRecord> create(@RequestBody NotificationRecord record) {
        return ApiResponse.ok(notificationService.create(record));
    }

    @Operation(summary = "通知记录列表")
    @GetMapping
    public ApiResponse<List<NotificationRecord>> list(@RequestParam(required = false) String receiverType,
                                                      @RequestParam(required = false) Long receiverId,
                                                      @RequestParam(required = false) String status) {
        return ApiResponse.ok(notificationService.list(receiverType, receiverId, status));
    }

    @Operation(summary = "标记通知已发送")
    @PostMapping("/{id}/mark-sent")
    public ApiResponse<NotificationRecord> markSent(@PathVariable Long id) {
        return ApiResponse.ok(notificationService.markSent(id));
    }
}
