package com.hrm.backend.controller;

import com.hrm.backend.entity.mongo.DashboardStatDoc;
import com.hrm.backend.service.DashboardStatService;
import com.hrm.backend.utils.HRConstants;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller cho Dashboard Statistics.
 * Xử lý các API liên quan đến thống kê dashboard từ MongoDB.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardStatService dashboardStatService;

    /**
     * API đồng bộ dữ liệu từ PostgreSQL sang MongoDB cho tháng hiện tại.
     * Chỉ Admin được phép gọi API này.
     *
     * @return Thống kê đã được đồng bộ
     */
    @PostMapping("/sync")
    @Secured(HRConstants.ROLE_ADMIN)
    public ResponseEntity<Map<String, Object>> syncCurrentMonthStats() {
        String monthKey = dashboardStatService.getCurrentMonthKey();
        Map<String, Object> result = dashboardStatService.syncStats(monthKey);
        return ResponseEntity.ok(result);
    }

    /**
     * API đồng bộ dữ liệu cho một tháng cụ thể.
     *
     * @param monthKey tháng cần đồng bộ (định dạng MM-yyyy)
     * @return Thống kê đã được đồng bộ
     */
    @PostMapping("/sync/{monthKey}")
    @Secured(HRConstants.ROLE_ADMIN)
    public ResponseEntity<Map<String, Object>> syncStatsByMonth(@PathVariable String monthKey) {
        Map<String, Object> result = dashboardStatService.syncStats(monthKey);
        return ResponseEntity.ok(result);
    }

    /**
     * API lấy thống kê tháng hiện tại.
     *
     * @return Thống kê của tháng hiện tại
     */
    @GetMapping("/stats")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<DashboardStatDoc> getCurrentStats() {
        String monthKey = dashboardStatService.getCurrentMonthKey();
        return dashboardStatService.getStatsByMonth(monthKey)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * API lấy thống kê theo tháng.
     *
     * @param monthKey tháng cần lấy (định dạng MM-yyyy)
     * @return Thống kê của tháng đó
     */
    @GetMapping("/stats/{monthKey}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<DashboardStatDoc> getStatsByMonth(@PathVariable String monthKey) {
        return dashboardStatService.getStatsByMonth(monthKey)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
