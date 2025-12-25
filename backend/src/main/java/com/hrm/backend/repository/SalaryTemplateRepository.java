package com.hrm.backend.repository;

import com.hrm.backend.entity.SalaryTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalaryTemplateRepository
        extends JpaRepository<SalaryTemplate, UUID>, JpaSpecificationExecutor<SalaryTemplate> {
    Optional<SalaryTemplate> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);
}
