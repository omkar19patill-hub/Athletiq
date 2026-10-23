package com.sportsphere.service;

import com.sportsphere.dto.response.dashboard.AdminDashboardResponse;
import com.sportsphere.dto.response.dashboard.CustomerDashboardResponse;

public interface DashboardService {
    AdminDashboardResponse getAdminDashboardStats();
    CustomerDashboardResponse getCustomerDashboardStats(String customerEmail);
}
