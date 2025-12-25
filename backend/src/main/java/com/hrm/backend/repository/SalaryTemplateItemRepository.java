package com.hrm.backend.repository;

import com.hrm.backend.entity.SalaryTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalaryTemplateItemRepository
        extends JpaRepository<SalaryTemplateItem, UUID>, JpaSpecificationExecutor<SalaryTemplateItem> {
    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    // Check uniqueness within the same template if needed, currently checking
    // globally or per template?
    // Usually code is unique per template. But let's assume global unique for
    // simplicity or per template.
    // Given the entity definition has code without unique constraint annotation
    // visible, but let's assume we want unique code.
    // If we want unique code per template:
    boolean existsByCodeAndSalaryTemplateId(String code, UUID salaryTemplateId);

    boolean existsByCodeAndSalaryTemplateIdAndIdNot(String code, UUID salaryTemplateId, UUID id);

    List<SalaryTemplateItem> findBySalaryTemplateId(UUID salaryTemplateId);
}
