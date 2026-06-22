package org.pingpongapp.pingsmartclubwebboot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.pingpongapp.pingsmartclubwebboot.auth.AuthRole;
import org.pingpongapp.pingsmartclubwebboot.auth.RequireRole;
import org.pingpongapp.pingsmartclubwebboot.common.ApiResponse;
import org.pingpongapp.pingsmartclubwebboot.pojo.Venue;
import org.pingpongapp.pingsmartclubwebboot.service.VenueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "场地管理")
@RestController
@RequestMapping("/admin/venues")
@RequireRole(AuthRole.ADMIN)
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @Operation(summary = "新增场地")
    @PostMapping
    public ApiResponse<Venue> create(@RequestBody Venue venue) {
        return ApiResponse.ok(venueService.create(venue));
    }

    @Operation(summary = "编辑场地")
    @PutMapping("/{id}")
    public ApiResponse<Venue> update(@PathVariable Long id, @RequestBody Venue venue) {
        return ApiResponse.ok(venueService.update(id, venue));
    }

    @Operation(summary = "场地详情")
    @GetMapping("/{id}")
    public ApiResponse<Venue> detail(@PathVariable Long id) {
        return ApiResponse.ok(venueService.getById(id));
    }

    @Operation(summary = "场地列表")
    @GetMapping
    public ApiResponse<List<Venue>> list(@RequestParam(required = false) String status) {
        return ApiResponse.ok(venueService.list(status));
    }
}
