package com.hrm.backend.repository;

import com.hrm.backend.entity.SalaryResultItemDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryResultItemDetailRepository extends
                JpaRepository<SalaryResultItemDetail, UUID>,
                JpaSpecificationExecutor<SalaryResultItemDetail> {

        List<SalaryResultItemDetail> findBySalaryResultItemIdAndVoidedFalse(UUID salaryResultItemId);

        List<SalaryResultItemDetail> findBySalaryTemplateItemIdAndVoidedFalse(UUID salaryTemplateItemId);

        boolean existsBySalaryResultItemIdAndSalaryTemplateItemId(UUID salaryResultItemId, UUID salaryTemplateItemId);

        boolean existsBySalaryResultItemIdAndSalaryTemplateItemIdAndIdNot(UUID salaryResultItemId,
                        UUID salaryTemplateItemId, UUID id);

        /**
         * Find existing detail by result item and template item
         */
        Optional<SalaryResultItemDetail> findBySalaryResultItemIdAndSalaryTemplateItemId(
                        UUID salaryResultItemId, UUID salaryTemplateItemId);
}
