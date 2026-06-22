package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.dto.LessonDtos;
import org.pingpongapp.pingsmartclubwebboot.pojo.LessonAccount;
import org.pingpongapp.pingsmartclubwebboot.pojo.LessonTransaction;
import org.pingpongapp.pingsmartclubwebboot.service.LessonAccountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "课时账户")
@RestController
@RequestMapping("/admin/lesson-accounts")
@RequireRole(AuthRole.ADMIN)
public class LessonAccountController {

    private final LessonAccountService lessonAccountService;

    public LessonAccountController(LessonAccountService lessonAccountService) {
        this.lessonAccountService = lessonAccountService;
    }

    @Operation(summary = "查询学员课时账户")
    @GetMapping("/{studentId}")
    public ApiResponse<LessonAccount> get(@PathVariable Long studentId) {
        return ApiResponse.ok(lessonAccountService.getByStudentId(studentId));
    }

    @Operation(summary = "后台录入购买/退款/调整课时")
    @PostMapping("/adjust")
    public ApiResponse<LessonAccount> adjust(@RequestBody LessonDtos.AdjustLessonRequest request) {
        return ApiResponse.ok(lessonAccountService.adjust(
            request.studentId(),
            request.changeHours(),
            request.transactionType(),
            request.remark()
        ));
    }

    @Operation(summary = "学员课时流水")
    @GetMapping("/{studentId}/transactions")
    public ApiResponse<List<LessonTransaction>> transactions(@PathVariable Long studentId) {
        return ApiResponse.ok(lessonAccountService.listTransactions(studentId));
    }
}
