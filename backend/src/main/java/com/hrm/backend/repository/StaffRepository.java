package com.hrm.backend.repository;

import com.hrm.backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID>, JpaSpecificationExecutor<Staff> {
    @Query("SELECT p FROM User u JOIN u.person p WHERE u.id = :userId AND TYPE(p) = Staff ")
    Staff findByUserId(@Param("userId") UUID userId);

    boolean existsByStaffCode(String staffCode);

    boolean existsByStaffCodeAndIdNot(String staffCode, UUID id);

    Optional<Staff> findByStaffCode(String staffCode);

    @Query("SELECT s.staffCode FROM Staff s WHERE s.staffCode LIKE CONCAT(:prefix, '%')")
    List<String> findStaffCodesStartingWith(@Param("prefix") String prefix);
}
