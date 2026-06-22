package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthContext;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthUser;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.dto.AuthDtos;
import org.pingpongapp.pingsmartclubwebboot.service.AuthService;
import org.springframework.web.bind.annotation.*;

@Tag(name = "登录鉴权")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "管理员登录")
    @PostMapping("/admin/login")
    public ApiResponse<AuthDtos.LoginResponse> adminLogin(@RequestBody AuthDtos.LoginRequest request) {
        return ApiResponse.ok(authService.login(request, AuthRole.ADMIN));
    }

    @Operation(summary = "教练登录")
    @PostMapping("/coach/login")
    public ApiResponse<AuthDtos.LoginResponse> coachLogin(@RequestBody AuthDtos.LoginRequest request) {
        return ApiResponse.ok(authService.login(request, AuthRole.COACH));
    }

    @Operation(summary = "学员/家长手机号登录")
    @PostMapping("/student/login")
    public ApiResponse<AuthDtos.LoginResponse> studentLogin(@RequestBody AuthDtos.LoginRequest request) {
        return ApiResponse.ok(authService.login(request, AuthRole.STUDENT_PARENT));
    }

    @Operation(summary = "当前登录人")
    @GetMapping("/me")
    public ApiResponse<AuthUser> me() {
        return ApiResponse.ok(AuthContext.getUser());
    }

    @Operation(summary = "退出登录")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request) {
        authService.logout(request.getHeader("Authorization"));
        return ApiResponse.ok();
    }
}
