package com.hrm.backend.repository;

import com.hrm.backend.entity.SalaryPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SalaryPeriodRepository
        extends JpaRepository<SalaryPeriod, UUID>, JpaSpecificationExecutor<SalaryPeriod> {
    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);
}
