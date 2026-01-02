package com.hrm.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for calculating salary
 */
@Data
@NoArgsConstructor
public class CalculateSalaryRequestDto {
    private UUID staffId; // Required - The staff to calculate salary for
    private Boolean allStaff; // Optional - If true, calculate for all staff
    private UUID salaryPeriodId; // Required - The salary period
    private UUID salaryResultId; // Optional - For recalculation of existing result

}
