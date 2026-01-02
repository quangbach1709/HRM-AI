package com.hrm.backend.service;

import com.hrm.backend.dto.CalculateSalaryRequestDto;
import com.hrm.backend.dto.CalculateSalaryResponseDto;

import java.util.List;

/**
 * Service for calculating employee salaries
 */
public interface SalaryCalculationService {

    /**
     * Calculate salary for a single staff member for a given salary period
     *
     * @param request The calculation request containing staffId and salaryPeriodId
     * @return The calculation result with all salary items
     */
    CalculateSalaryResponseDto calculate(CalculateSalaryRequestDto request);

    List<CalculateSalaryResponseDto> calculateAllStaff(CalculateSalaryRequestDto request);
}
