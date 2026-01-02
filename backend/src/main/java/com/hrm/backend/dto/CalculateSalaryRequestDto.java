package com.hrm.backend.dto;

import java.util.UUID;

/**
 * Request DTO for calculating salary
 */
public class CalculateSalaryRequestDto {
    private UUID staffId; // Required - The staff to calculate salary for
    private UUID salaryPeriodId; // Required - The salary period
    private UUID salaryResultId; // Optional - For recalculation of existing result

    public CalculateSalaryRequestDto() {
    }

    public UUID getStaffId() {
        return staffId;
    }

    public void setStaffId(UUID staffId) {
        this.staffId = staffId;
    }

    public UUID getSalaryPeriodId() {
        return salaryPeriodId;
    }

    public void setSalaryPeriodId(UUID salaryPeriodId) {
        this.salaryPeriodId = salaryPeriodId;
    }

    public UUID getSalaryResultId() {
        return salaryResultId;
    }

    public void setSalaryResultId(UUID salaryResultId) {
        this.salaryResultId = salaryResultId;
    }
}
