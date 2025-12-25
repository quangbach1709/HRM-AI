package com.hrm.backend.repository;

import com.hrm.backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID>, JpaSpecificationExecutor<Staff> {

    boolean existsByStaffCode(String staffCode);

    boolean existsByStaffCodeAndIdNot(String staffCode, UUID id);

    Optional<Staff> findByStaffCode(String staffCode);
}
