package com.hrm.backend.service.impl;

import com.hrm.backend.entity.mongo.DashboardStatDoc;
import com.hrm.backend.repository.mongo.DashboardStatRepository;
import com.hrm.backend.service.DashboardStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Implementation của DashboardStatService.
 * Sử dụng MongoTemplate để thực hiện các atomic update operations
 * với toán tử $inc (increment) và upsert (tạo mới nếu chưa tồn tại).
 */
@Service
@RequiredArgsConstructor
public class DashboardStatServiceImpl implements DashboardStatService {

    private final DashboardStatRepository dashboardStatRepository;
    private final MongoTemplate mongoTemplate;

    // ========== Basic CRUD ==========

    @Override
    public Optional<DashboardStatDoc> getByMonth(String monthKey) {
        return dashboardStatRepository.findById(monthKey);
    }

    @Override
    public List<DashboardStatDoc> getByYear(String year) {
        return dashboardStatRepository.findByIdContaining(year);
    }

    @Override
    public DashboardStatDoc save(DashboardStatDoc doc) {
        return dashboardStatRepository.save(doc);
    }

    // ========== Admin Stats ==========

    @Override
    public void incrementTotalUsers(String monthKey) {
        atomicIncrement(monthKey, "admin_stats.total_users", 1L);
    }

    @Override
    public void decrementTotalUsers(String monthKey) {
        atomicIncrement(monthKey, "admin_stats.total_users", -1L);
    }

    // ========== Manager Stats ==========

    @Override
    public void incrementTotalDepartments(String monthKey) {
        atomicIncrement(monthKey, "manager_stats.total_departments", 1L);
    }

    @Override
    public void decrementTotalDepartments(String monthKey) {
        atomicIncrement(monthKey, "manager_stats.total_departments", -1L);
    }

    @Override
    public void incrementTotalSalaryTemplates(String monthKey) {
        atomicIncrement(monthKey, "manager_stats.total_salary_templates", 1L);
    }

    @Override
    public void decrementTotalSalaryTemplates(String monthKey) {
        atomicIncrement(monthKey, "manager_stats.total_salary_templates", -1L);
    }

    // ========== HR Stats ==========

    @Override
    public void incrementTotalEmployees(String monthKey) {
        atomicIncrement(monthKey, "hr_stats.total_employees", 1L);
    }

    @Override
    public void decrementTotalEmployees(String monthKey) {
        atomicIncrement(monthKey, "hr_stats.total_employees", -1L);
    }

    @Override
    public void incrementOpenPositions(String monthKey) {
        atomicIncrement(monthKey, "hr_stats.open_positions", 1);
    }

    @Override
    public void decrementOpenPositions(String monthKey) {
        atomicIncrement(monthKey, "hr_stats.open_positions", -1);
    }

    @Override
    public void incrementCompletedAttendance(String monthKey) {
        atomicIncrement(monthKey, "hr_stats.completed_attendance", 1L);
    }

    @Override
    public void decrementCompletedAttendance(String monthKey) {
        atomicIncrement(monthKey, "hr_stats.completed_attendance", -1L);
    }

    // ========== Private Helper Methods ==========

    /**
     * Thực hiện atomic increment trên một field.
     * Sử dụng MongoDB $inc operator và upsert = true.
     *
     * @param monthKey  ID document (định dạng MM-YYYY)
     * @param fieldPath đường dẫn field (VD: "admin_stats.total_users")
     * @param delta     giá trị tăng/giảm
     */
    private void atomicIncrement(String monthKey, String fieldPath, Number delta) {
        Query query = new Query(Criteria.where("_id").is(monthKey));
        Update update = new Update().inc(fieldPath, delta);

        // upsert = true: nếu document chưa tồn tại sẽ tự động tạo mới
        mongoTemplate.upsert(query, update, DashboardStatDoc.class);
    }
}
