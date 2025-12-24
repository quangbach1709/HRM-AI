package com.hrm.backend.repository;

import com.hrm.backend.entity.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID>, JpaSpecificationExecutor<Department> {

        Optional<Department> findByCode(String code);

        boolean existsByCode(String code);

        // Find all root departments (no parent)
        List<Department> findByParentIsNullAndVoidedFalseOrderByNameAsc();

        Page<Department> findByParentIsNullAndVoidedFalse(Pageable pageable);

        // Find sub-departments by parent
        List<Department> findByParentIdAndVoidedFalseOrderByNameAsc(UUID parentId);

        Page<Department> findByParentIdAndVoidedFalse(UUID parentId, Pageable pageable);

        // Search by name or code
        @Query("SELECT d FROM Department d WHERE d.voided = false AND " +
                        "(LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(d.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
        Page<Department> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

        // Find all active departments
        List<Department> findByVoidedFalseOrderByNameAsc();

        // Search by name or code - returns List
        @Query("SELECT d FROM Department d WHERE d.voided = false AND " +
                        "(LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(d.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY d.name ASC")
        List<Department> searchByKeywordList(@Param("keyword") String keyword);
}
