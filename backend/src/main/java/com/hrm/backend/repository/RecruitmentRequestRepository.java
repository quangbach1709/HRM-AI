package com.hrm.backend.repository;

import com.hrm.backend.entity.RecruitmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RecruitmentRequestRepository extends
        JpaRepository<RecruitmentRequest, UUID>,
        JpaSpecificationExecutor<RecruitmentRequest> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);
}
