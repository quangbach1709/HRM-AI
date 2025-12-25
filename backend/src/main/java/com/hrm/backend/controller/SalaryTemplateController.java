package com.hrm.backend.controller;

import com.hrm.backend.dto.SalaryTemplateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryTemplateDto;
import com.hrm.backend.service.SalaryTemplateService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryTemplateController {

    private final SalaryTemplateService service;

    // ==================== PAGINATION ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<SalaryTemplateDto>> search(@RequestBody SearchSalaryTemplateDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<SalaryTemplateDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @GetMapping
    public ResponseEntity<PageResponse<SalaryTemplateDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            // Filter fields
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description) {
        SearchSalaryTemplateDto dto = new SearchSalaryTemplateDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        dto.setCode(code);
        dto.setName(name);
        dto.setDescription(description);

        return ResponseEntity.ok(service.search(dto));
    }

    // ==================== CRUD ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @GetMapping("/{id}")
    public ResponseEntity<SalaryTemplateDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PostMapping
    public ResponseEntity<SalaryTemplateDto> create(@RequestBody SalaryTemplateDto dto) {
        SalaryTemplateDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PutMapping("/{id}")
    public ResponseEntity<SalaryTemplateDto> update(@PathVariable UUID id, @RequestBody SalaryTemplateDto dto) {
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
    public ResponseEntity<List<SalaryTemplateDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PostMapping("/export")
    public ResponseEntity<List<SalaryTemplateDto>> export(@RequestBody SearchSalaryTemplateDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
