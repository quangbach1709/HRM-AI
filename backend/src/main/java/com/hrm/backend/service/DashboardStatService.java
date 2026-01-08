package com.hrm.backend.service;

import com.hrm.backend.entity.mongo.DashboardStatDoc;

import java.util.List;
import java.util.Optional;

/**
 * Service interface cho thao tác với DashboardStatDoc (MongoDB).
 * Cung cấp các phương thức atomic update an toàn với nhiều thread.
 * Thống kê được chia theo quyền: Admin, Manager, HR.
 */
public interface DashboardStatService {

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
}
