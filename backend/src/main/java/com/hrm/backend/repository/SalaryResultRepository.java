package com.hrm.backend.repository;

import com.hrm.backend.entity.SalaryResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SalaryResultRepository extends
        JpaRepository<SalaryResult, UUID>,
        JpaSpecificationExecutor<SalaryResult> {
}
