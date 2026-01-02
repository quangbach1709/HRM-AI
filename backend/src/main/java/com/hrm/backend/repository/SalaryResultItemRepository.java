package com.hrm.backend.repository;

import com.hrm.backend.entity.SalaryResultItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryResultItemRepository extends
        JpaRepository<SalaryResultItem, UUID>,
        JpaSpecificationExecutor<SalaryResultItem> {

    List<SalaryResultItem> findBySalaryResultIdAndVoidedFalse(UUID salaryResultId);

    List<SalaryResultItem> findByStaffIdAndVoidedFalse(UUID staffId);

    boolean existsBySalaryResultIdAndStaffId(UUID salaryResultId, UUID staffId);

    boolean existsBySalaryResultIdAndStaffIdAndIdNot(UUID salaryResultId, UUID staffId, UUID id);

    /**
     * Find existing salary result item for a staff in a specific salary result
     */
    Optional<SalaryResultItem> findBySalaryResultIdAndStaffId(UUID salaryResultId, UUID staffId);
}
