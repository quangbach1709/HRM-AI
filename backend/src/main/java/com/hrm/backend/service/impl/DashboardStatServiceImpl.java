package com.hrm.backend.service.impl;

import com.hrm.backend.entity.mongo.DashboardStatDoc;
import com.hrm.backend.repository.*;
import com.hrm.backend.repository.mongo.DashboardStatRepository;
import com.hrm.backend.service.DashboardStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    // JPA Repositories để đồng bộ dữ liệu
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SalaryTemplateRepository salaryTemplateRepository;
    private final StaffRepository staffRepository;
    private final RecruitmentRequestRepository recruitmentRequestRepository;
    private final StaffWorkScheduleRepository staffWorkScheduleRepository;

    // ========== Sync & Query ==========

    @Override
    public Map<String, Object> syncStats(String monthKey) {
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

        return result;
    }

    @Override
    public Optional<DashboardStatDoc> getStatsByMonth(String monthKey) {
        Query query = new Query(Criteria.where("_id").is(monthKey));
        DashboardStatDoc stats = mongoTemplate.findOne(query, DashboardStatDoc.class);
        return Optional.ofNullable(stats);
    }

    @Override
    public String getCurrentMonthKey() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("MM-yyyy"));
    }

    /**
     * Đếm số ca chấm công đủ (WORKED_FULL_HOURS = 4)
     */
    private long countCompletedAttendance() {
        // TODO: Có thể tạo custom query trong StaffWorkScheduleRepository
        // để đếm chính xác với shiftWorkStatus = 4
        return staffWorkScheduleRepository.count();
    }

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

    @Override
    public String generateMonthKey(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM-yyyy");
        return dateTime.format(formatter);
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
