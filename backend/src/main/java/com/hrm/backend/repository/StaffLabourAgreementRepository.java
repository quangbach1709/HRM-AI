package com.hrm.backend.repository;

import com.hrm.backend.entity.StaffLabourAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StaffLabourAgreementRepository
        extends JpaRepository<StaffLabourAgreement, UUID>, JpaSpecificationExecutor<StaffLabourAgreement> {
    boolean existsByLabourAgreementNumber(String labourAgreementNumber);

    boolean existsByLabourAgreementNumberAndIdNot(String labourAgreementNumber, UUID id);
}
