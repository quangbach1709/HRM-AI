package com.hrm.backend.repository;

import com.hrm.backend.entity.Position;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID>, JpaSpecificationExecutor<Position> {

    Optional<Position> findByCode(String code);

    boolean existsByCode(String code);

    // Find all positions by department
    List<Position> findByDepartmentIdAndVoidedFalse(UUID departmentId);

    Page<Position> findByDepartmentIdAndVoidedFalse(UUID departmentId, Pageable pageable);

    // Search by name or code
    @Query("SELECT p FROM Position p WHERE p.voided = false AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Position> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Find all active positions
    List<Position> findByVoidedFalseOrderByNameAsc();
}
