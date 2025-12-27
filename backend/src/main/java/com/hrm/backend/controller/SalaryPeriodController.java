package com.hrm.backend.controller;

import com.hrm.backend.dto.SalaryPeriodDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryPeriodDto;
import com.hrm.backend.service.SalaryPeriodService;
import com.hrm.backend.utils.HRConstants;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-periods")
@CrossOrigin(origins = "*")
public class SalaryPeriodController {

    private final SalaryPeriodService service;

    
    public  SalaryPeriodController(SalaryPeriodService service) {
        this.service = service;
    }

    // ==================== PAGINATION ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<SalaryPeriodDto>> search(@RequestBody SearchSalaryPeriodDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<SalaryPeriodDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @GetMapping
    public ResponseEntity<PageResponse<SalaryPeriodDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,

            // Filters
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer salaryPeriodStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDateTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDateTo) {
        SearchSalaryPeriodDto dto = new SearchSalaryPeriodDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        dto.setCode(code);
        dto.setName(name);
        dto.setSalaryPeriodStatus(salaryPeriodStatus);
        dto.setStartDateFrom(startDateFrom);
        dto.setStartDateTo(startDateTo);
        dto.setEndDateFrom(endDateFrom);
        dto.setEndDateTo(endDateTo);

        return ResponseEntity.ok(service.search(dto));
    }

    // ==================== CRUD ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @GetMapping("/{id}")
    public ResponseEntity<SalaryPeriodDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PostMapping
    public ResponseEntity<SalaryPeriodDto> create(@RequestBody SalaryPeriodDto dto) {
        SalaryPeriodDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PutMapping("/{id}")
    public ResponseEntity<SalaryPeriodDto> update(@PathVariable UUID id, @RequestBody SalaryPeriodDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ADDITIONAL ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @GetMapping("/all")
    public ResponseEntity<List<SalaryPeriodDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PostMapping("/export")
    public ResponseEntity<List<SalaryPeriodDto>> export(@RequestBody SearchSalaryPeriodDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
