package com.hrm.backend.controller;

import com.hrm.backend.dto.CalculateSalaryRequestDto;
import com.hrm.backend.dto.CalculateSalaryResponseDto;
import com.hrm.backend.dto.SalaryResultDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultDto;
import com.hrm.backend.service.SalaryCalculationService;
import com.hrm.backend.service.SalaryResultService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-results")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryResultController {

    private final SalaryResultService service;
    private final SalaryCalculationService salaryCalculationService;

    // ==================== SALARY CALCULATION ====================

    /**
     * Calculate salary for a single staff member
     * 
     * @param request Contains staffId and salaryPeriodId
     * @return Calculated salary details
     */
    @PostMapping("/calculate")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<CalculateSalaryResponseDto> calculateSalary(
            @RequestBody CalculateSalaryRequestDto request) {
        return ResponseEntity.ok(salaryCalculationService.calculate(request));
    }

    /**
     * Calculate salary for all staff members
     *
     * @param request Contains salaryPeriodId
     * @return List of calculation requests for all staff
     */
    @PostMapping("/calculate-all")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<List<CalculateSalaryResponseDto>> calculateSalaryForAll(
            @RequestBody CalculateSalaryRequestDto request) {
        return ResponseEntity.ok(salaryCalculationService.calculateAllStaff(request));
    }

    // ==================== CRUD OPERATIONS ====================

    @PostMapping("/search")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<PageResponse<SalaryResultDto>> search(
            @RequestBody SearchSalaryResultDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @GetMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<SalaryResultDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<SalaryResultDto> create(@RequestBody SalaryResultDto dto) {
        SalaryResultDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<SalaryResultDto> update(
            @PathVariable UUID id,
            @RequestBody SalaryResultDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<List<SalaryResultDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping("/export")
    @Secured({ HRConstants.ROLE_ADMIN , HRConstants.ROLE_HR, HRConstants.ROLE_MANAGER })
    public ResponseEntity<List<SalaryResultDto>> export(
            @RequestBody SearchSalaryResultDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
