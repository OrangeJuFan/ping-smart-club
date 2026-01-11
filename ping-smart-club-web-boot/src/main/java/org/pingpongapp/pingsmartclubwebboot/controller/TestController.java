package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 测试控制器（用于测试 Swagger 配置）
 */
@Tag(name = "测试接口", description = "用于测试系统是否正常工作的接口")
@RestController
@RequestMapping("/test")
public class TestController {

    @Operation(summary = "健康检查", description = "检查系统是否正常运行")
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "ok");
        result.put("message", "系统运行正常");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    @Operation(summary = "获取系统信息", description = "获取系统基本信息")
    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> result = new HashMap<>();
        result.put("application", "Ping Smart Club");
        result.put("version", "1.0.0");
        result.put("description", "乒智管 - 乒乓球俱乐部管理系统");
        return result;
    }
}
