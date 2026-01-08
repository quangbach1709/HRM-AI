package com.hrm.backend.entity.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * MongoDB Document cho thống kê Dashboard theo tháng và quyền.
 * Mỗi document đại diện cho một tháng (VD: "01-2024").
 * Được sử dụng làm Read Model trong mô hình CQRS.
 */
@Document(collection = "dashboard_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatDoc {

    /**
     * ID định dạng "MM-YYYY" (VD: "01-2024" cho tháng 1/2024)
     */
    @Id
    private String id;

    @Field("admin_stats")
    private AdminStats adminStats;

    @Field("manager_stats")
    private ManagerStats managerStats;

    @Field("hr_stats")
    private HrStats hrStats;

    // ========== Inner Classes ==========

    /**
     * Thống kê dành cho Admin
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminStats {
        @Field("total_users")
        private Long totalUsers;
    }

    /**
     * Thống kê dành cho Manager
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerStats {
        @Field("total_departments")
        private Long totalDepartments;

        @Field("total_salary_templates")
        private Long totalSalaryTemplates;
    }

    /**
     * Thống kê dành cho HR
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HrStats {
        @Field("total_employees")
        private Long totalEmployees;

        @Field("open_positions")
        private Integer openPositions;

        @Field("completed_attendance")
        private Long completedAttendance;
    }
}
