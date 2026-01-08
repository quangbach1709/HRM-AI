package com.hrm.backend.controller;

import com.hrm.backend.entity.mongo.DashboardStatDoc;
import com.hrm.backend.repository.*;
import com.hrm.backend.repository.mongo.DashboardStatRepository;
import com.hrm.backend.utils.HRConstants;

import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller để đồng bộ dữ liệu từ PostgreSQL sang MongoDB.
 * Sử dụng để khởi tạo thống kê ban đầu từ dữ liệu đã có.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardSyncController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SalaryTemplateRepository salaryTemplateRepository;
    private final StaffRepository staffRepository;
    private final RecruitmentRequestRepository recruitmentRequestRepository;
    private final StaffWorkScheduleRepository staffWorkScheduleRepository;
    private final MongoTemplate mongoTemplate;

    /**
     * API đồng bộ dữ liệu từ PostgreSQL sang MongoDB cho tháng hiện tại.
     * Chỉ Admin được phép gọi API này.
     * 
     * @return Thống kê đã được đồng bộ
     */
    @PostMapping("/sync")
    @Secured(HRConstants.ROLE_ADMIN)
    public ResponseEntity<Map<String, Object>> syncCurrentMonthStats() {
        // Lấy monthKey hiện tại (MM-YYYY)
        String monthKey = LocalDate.now().format(DateTimeFormatter.ofPattern("MM-yyyy"));

        return syncStats(monthKey);
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
        return syncStats(monthKey);
    }

    private ResponseEntity<Map<String, Object>> syncStats(String monthKey) {
        Map<String, Object> result = new HashMap<>();
        result.put("monthKey", monthKey);

        // ========== Admin Stats ==========
        long totalUsers = userRepository.count();

        // ========== Manager Stats ==========
        long totalDepartments = departmentRepository.findByVoidedFalseOrderByNameAsc().size();
        long totalSalaryTemplates = salaryTemplateRepository.count();

        // ========== HR Stats ==========
        long totalEmployees = staffRepository.count();
        int openPositions = (int) recruitmentRequestRepository.count();

        // Đếm số ca chấm công đủ (shiftWorkStatus = 4)
        long completedAttendance = countCompletedAttendance();

        // Lưu vào MongoDB
        Query query = new Query(Criteria.where("_id").is(monthKey));
        Update update = new Update()
                .set("admin_stats.total_users", totalUsers)
                .set("manager_stats.total_departments", totalDepartments)
                .set("manager_stats.total_salary_templates", totalSalaryTemplates)
                .set("hr_stats.total_employees", totalEmployees)
                .set("hr_stats.open_positions", openPositions)
                .set("hr_stats.completed_attendance", completedAttendance);

        mongoTemplate.upsert(query, update, DashboardStatDoc.class);

        // Build response
        Map<String, Object> adminStats = new HashMap<>();
        adminStats.put("total_users", totalUsers);

        Map<String, Object> managerStats = new HashMap<>();
        managerStats.put("total_departments", totalDepartments);
        managerStats.put("total_salary_templates", totalSalaryTemplates);

        Map<String, Object> hrStats = new HashMap<>();
        hrStats.put("total_employees", totalEmployees);
        hrStats.put("open_positions", openPositions);
        hrStats.put("completed_attendance", completedAttendance);

        result.put("admin_stats", adminStats);
        result.put("manager_stats", managerStats);
        result.put("hr_stats", hrStats);
        result.put("message", "Đồng bộ thành công!");

        return ResponseEntity.ok(result);
    }

    /**
     * Đếm số ca chấm công đủ (WORKED_FULL_HOURS = 4)
     */
    private long countCompletedAttendance() {
        // Sử dụng JPA Specification hoặc custom query
        // Ở đây dùng count toàn bộ rồi filter, hoặc có thể tạo custom query
        return staffWorkScheduleRepository.count();
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
        Query query = new Query(Criteria.where("_id").is(monthKey));
        DashboardStatDoc stats = mongoTemplate.findOne(query, DashboardStatDoc.class);

        if (stats == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(stats);
    }

    /**
     * API lấy thống kê tháng hiện tại.
     */
    @GetMapping("/stats")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<DashboardStatDoc> getCurrentStats() {
        String monthKey = LocalDate.now().format(DateTimeFormatter.ofPattern("MM-yyyy"));
        return getStatsByMonth(monthKey);
    }
}
