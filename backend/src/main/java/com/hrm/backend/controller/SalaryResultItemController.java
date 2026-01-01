package com.hrm.backend.controller;

import com.hrm.backend.dto.SalaryResultItemDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultItemDto;
import com.hrm.backend.service.SalaryResultItemService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-result-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryResultItemController {

    private final SalaryResultItemService service;

    @PostMapping("/search")
    @Secured({HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR})
    public ResponseEntity<PageResponse<SalaryResultItemDto>> search(
            @RequestBody SearchSalaryResultItemDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @GetMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<SalaryResultItemDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<SalaryResultItemDto> create(@RequestBody SalaryResultItemDto dto) {
        SalaryResultItemDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<SalaryResultItemDto> update(
            @PathVariable UUID id,
            @RequestBody SalaryResultItemDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<List<SalaryResultItemDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/by-salary-result/{salaryResultId}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<List<SalaryResultItemDto>> getBySalaryResultId(
            @PathVariable UUID salaryResultId) {
        return ResponseEntity.ok(service.getBySalaryResultId(salaryResultId));
    }

    @PostMapping("/export")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<List<SalaryResultItemDto>> export(
            @RequestBody SearchSalaryResultItemDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
