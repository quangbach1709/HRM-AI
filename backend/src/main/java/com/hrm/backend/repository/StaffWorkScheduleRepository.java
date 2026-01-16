package com.hrm.backend.repository;

import com.hrm.backend.entity.StaffWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.UUID;

@Repository
public interface StaffWorkScheduleRepository extends
                JpaRepository<StaffWorkSchedule, UUID>,
                JpaSpecificationExecutor<StaffWorkSchedule> {

        /**
         * Calculate actual working days for a staff within date range
         * ShiftWorkType: 1 = Morning (0.5), 2 = Afternoon (0.5), 3 = Full day (1.0)
         * ShiftWorkStatus: 4 = WORKED_FULL_HOURS
         */
        @Query("SELECT COALESCE(SUM(CASE WHEN s.shiftWorkType = 3 THEN 1.0 " +
                        "WHEN s.shiftWorkType IN (1, 2) THEN 0.5 ELSE 0 END), 0) " +
                        "FROM StaffWorkSchedule s WHERE s.staff.id = :staffId " +
                        "AND s.workingDate BETWEEN :startDate AND :endDate " +
                        "AND s.shiftWorkStatus = 4 AND (s.voided = false OR s.voided IS NULL)")
        Double calculateActualWorkingDays(@Param("staffId") UUID staffId,
                        @Param("startDate") Date startDate,
                        @Param("endDate") Date endDate);

        /**
         * Find StaffWorkSchedule by staff ID and working date (comparing only DATE,
         * ignoring time)
         */
        @Query("SELECT s FROM StaffWorkSchedule s WHERE s.staff.id = :staffId " +
                        "AND DATE(s.workingDate) = DATE(:workingDate) " +
                        "AND (s.voided = false OR s.voided IS NULL)")
        StaffWorkSchedule findByStaffIdAndWorkingDate(@Param("staffId") UUID staffId,
                        @Param("workingDate") Date workingDate);

        /**
         * Mark ABSENT for staff who have not checked in on a specific date.
         * This method updates records directly in the database for performance
         * optimization.
         * Conditions:
         * - workingDate matches the given targetDate
         * - checkIn is NULL (staff has not checked in)
         * - checkOut is NULL
         * - voided = false (not soft-deleted)
         * 
         * Note: Uses CAST for PostgreSQL compatibility.
         * Job runs at midnight, so we pass yesterday's date as the target.
         * 
         * @param targetDate the date to mark absent for
         * @return number of records updated
         */
        @Modifying
        @Query("UPDATE StaffWorkSchedule s SET s.shiftWorkStatus = 5 " +
                        "WHERE CAST(s.workingDate AS date) = CAST(:targetDate AS date) " +
                        "AND s.checkIn IS NULL " +
                        "AND s.checkOut IS NULL " +
                        "AND (s.voided = false OR s.voided IS NULL)")
        int markAbsentForStaffWithoutCheckIn(@Param("targetDate") Date targetDate);
}
