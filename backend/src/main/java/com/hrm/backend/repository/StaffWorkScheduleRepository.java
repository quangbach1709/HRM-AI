package com.hrm.backend.repository;

import com.hrm.backend.entity.StaffWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StaffWorkScheduleRepository extends
        JpaRepository<StaffWorkSchedule, UUID>,
        JpaSpecificationExecutor<StaffWorkSchedule> {

    // Additional query methods can be added here if needed
}
