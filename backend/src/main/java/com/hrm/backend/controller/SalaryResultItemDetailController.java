package com.hrm.backend.controller;

import com.hrm.backend.dto.SalaryResultItemDetailDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultItemDetailDto;
import com.hrm.backend.service.SalaryResultItemDetailService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-result-item-details")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryResultItemDetailController {

    private final SalaryResultItemDetailService service;

    @PostMapping("/search")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<PageResponse<SalaryResultItemDetailDto>> search(
            @RequestBody SearchSalaryResultItemDetailDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @PostMapping("/current-user/search")
    @Secured({ HRConstants.ROLE_USER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<PageResponse<SalaryResultItemDetailDto>> searchForCurrentUser(@RequestBody SearchSalaryResultItemDetailDto dto) {
        return ResponseEntity.ok(service.searchForCurrentUser(dto));
    }


    @GetMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<SalaryResultItemDetailDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<SalaryResultItemDetailDto> create(@RequestBody SalaryResultItemDetailDto dto) {
        SalaryResultItemDetailDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<SalaryResultItemDetailDto> update(
            @PathVariable UUID id,
            @RequestBody SalaryResultItemDetailDto dto) {
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
    public ResponseEntity<List<SalaryResultItemDetailDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/by-salary-result-item/{salaryResultItemId}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<List<SalaryResultItemDetailDto>> getBySalaryResultItemId(
            @PathVariable UUID salaryResultItemId) {
        return ResponseEntity.ok(service.getBySalaryResultItemId(salaryResultItemId));
    }

    @PostMapping("/export")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<List<SalaryResultItemDetailDto>> export(
            @RequestBody SearchSalaryResultItemDetailDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
