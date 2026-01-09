package com.hrm.backend.service;

import com.hrm.backend.entity.mongo.DashboardStatDoc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service interface cho thao tác với DashboardStatDoc (MongoDB).
 * Cung cấp các phương thức atomic update an toàn với nhiều thread.
 * Thống kê được chia theo quyền: Admin, Manager, HR.
 */
public interface DashboardStatService {

    // ========== Sync & Query ==========

    /**
     * Đồng bộ dữ liệu từ PostgreSQL sang MongoDB cho tháng được chỉ định.
     * 
     * @param monthKey tháng cần đồng bộ (định dạng MM-yyyy)
     * @return Map chứa các thống kê đã được đồng bộ
     */
    Map<String, Object> syncStats(String monthKey);

    /**
     * Lấy thống kê theo tháng.
     * 
     * @param monthKey tháng cần lấy (định dạng MM-yyyy)
     * @return Optional chứa DashboardStatDoc hoặc empty nếu không có
     */
    Optional<DashboardStatDoc> getStatsByMonth(String monthKey);

    // ========== Basic CRUD ==========

    Optional<DashboardStatDoc> getByMonth(String monthKey);

    List<DashboardStatDoc> getByYear(String year);

    DashboardStatDoc save(DashboardStatDoc doc);

    // ========== Admin Stats ==========

    /** Tăng tổng số người dùng */
    void incrementTotalUsers(String monthKey);

    /** Giảm tổng số người dùng */
    void decrementTotalUsers(String monthKey);

    // ========== Manager Stats ==========

    /** Tăng tổng số phòng ban */
    void incrementTotalDepartments(String monthKey);

    /** Giảm tổng số phòng ban */
    void decrementTotalDepartments(String monthKey);

    /** Tăng tổng số mẫu lương */
    void incrementTotalSalaryTemplates(String monthKey);

    /** Giảm tổng số mẫu lương */
    void decrementTotalSalaryTemplates(String monthKey);

    // ========== HR Stats ==========

    /** Tăng tổng số nhân viên */
    void incrementTotalEmployees(String monthKey);

    /** Giảm tổng số nhân viên */
    void decrementTotalEmployees(String monthKey);

    /** Tăng số vị trí đang tuyển */
    void incrementOpenPositions(String monthKey);

    /** Giảm số vị trí đang tuyển */
    void decrementOpenPositions(String monthKey);

    /** Tăng số ca chấm công đủ */
    void incrementCompletedAttendance(String monthKey);

    /** Giảm số ca chấm công đủ */
    void decrementCompletedAttendance(String monthKey);

    String generateMonthKey(LocalDateTime dateTime);

    /**
     * Lấy monthKey của tháng hiện tại.
     * 
     * @return monthKey định dạng MM-yyyy
     */
    String getCurrentMonthKey();
}
