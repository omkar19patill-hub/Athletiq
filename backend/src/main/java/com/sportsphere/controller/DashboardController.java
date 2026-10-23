package com.sportsphere.controller;

import com.sportsphere.constants.ApiConstants;
import com.sportsphere.dto.response.ApiResponse;
import com.sportsphere.dto.response.dashboard.AdminDashboardResponse;
import com.sportsphere.dto.response.dashboard.CustomerDashboardResponse;
import com.sportsphere.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.DASHBOARD)
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Endpoints for admin and customer dashboard metrics and analytics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard overview metrics, charts and analytics (Admin only)")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved",
                dashboardService.getAdminDashboardStats()));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get customer dashboard overview metrics (Customer only)")
    public ResponseEntity<ApiResponse<CustomerDashboardResponse>> getCustomerDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Customer stats retrieved",
                dashboardService.getCustomerDashboardStats(userDetails.getUsername())));
    }
}
