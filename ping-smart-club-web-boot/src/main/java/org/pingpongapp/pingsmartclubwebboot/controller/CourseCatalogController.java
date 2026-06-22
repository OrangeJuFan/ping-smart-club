package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseProduct;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseType;
import org.pingpongapp.pingsmartclubwebboot.service.CourseCatalogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "课程产品")
@RestController
@RequestMapping("/admin")
@RequireRole(AuthRole.ADMIN)
public class CourseCatalogController {

    private final CourseCatalogService courseCatalogService;

    public CourseCatalogController(CourseCatalogService courseCatalogService) {
        this.courseCatalogService = courseCatalogService;
    }

    @Operation(summary = "新增课程类型")
    @PostMapping("/course-types")
    public ApiResponse<CourseType> createType(@RequestBody CourseType type) {
        return ApiResponse.ok(courseCatalogService.createType(type));
    }

    @Operation(summary = "编辑课程类型")
    @PutMapping("/course-types/{id}")
    public ApiResponse<CourseType> updateType(@PathVariable Long id, @RequestBody CourseType type) {
        return ApiResponse.ok(courseCatalogService.updateType(id, type));
    }

    @Operation(summary = "课程类型列表")
    @GetMapping("/course-types")
    public ApiResponse<List<CourseType>> listTypes() {
        return ApiResponse.ok(courseCatalogService.listTypes());
    }

    @Operation(summary = "新增课程产品")
    @PostMapping("/course-products")
    public ApiResponse<CourseProduct> createProduct(@RequestBody CourseProduct product) {
        return ApiResponse.ok(courseCatalogService.createProduct(product));
    }

    @Operation(summary = "编辑课程产品")
    @PutMapping("/course-products/{id}")
    public ApiResponse<CourseProduct> updateProduct(@PathVariable Long id, @RequestBody CourseProduct product) {
        return ApiResponse.ok(courseCatalogService.updateProduct(id, product));
    }

    @Operation(summary = "课程产品列表")
    @GetMapping("/course-products")
    public ApiResponse<List<CourseProduct>> listProducts(@RequestParam(required = false) String status) {
        return ApiResponse.ok(courseCatalogService.listProducts(status));
    }
}
