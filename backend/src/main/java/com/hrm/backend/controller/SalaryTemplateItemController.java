package com.hrm.backend.controller;

import com.hrm.backend.dto.SalaryTemplateItemDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryTemplateItemDto;
import com.hrm.backend.service.SalaryTemplateItemService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-template-items")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryTemplateItemController {

    private final SalaryTemplateItemService service;

    // ==================== PAGINATION ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<SalaryTemplateItemDto>> search(@RequestBody SearchSalaryTemplateItemDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @GetMapping
    public ResponseEntity<PageResponse<SalaryTemplateItemDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,

            // Filters
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) UUID salaryTemplateId,
            @RequestParam(required = false) Integer salaryItemType) {
        SearchSalaryTemplateItemDto dto = new SearchSalaryTemplateItemDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);

        dto.setCode(code);
        dto.setName(name);
        dto.setSalaryTemplateId(salaryTemplateId);
        dto.setSalaryItemType(salaryItemType);

        return ResponseEntity.ok(service.search(dto));
    }

    // ==================== CRUD ====================

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @GetMapping("/{id}")
    public ResponseEntity<SalaryTemplateItemDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PostMapping
    public ResponseEntity<SalaryTemplateItemDto> create(@RequestBody SalaryTemplateItemDto dto) {
        SalaryTemplateItemDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PutMapping("/{id}")
    public ResponseEntity<SalaryTemplateItemDto> update(@PathVariable UUID id, @RequestBody SalaryTemplateItemDto dto) {
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
    public ResponseEntity<List<SalaryTemplateItemDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @GetMapping("/by-template/{templateId}")
    public ResponseEntity<List<SalaryTemplateItemDto>> getByTemplateId(@PathVariable UUID templateId) {
        return ResponseEntity.ok(service.getBySalaryTemplateId(templateId));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN })
    @PostMapping("/export")
    public ResponseEntity<List<SalaryTemplateItemDto>> export(@RequestBody SearchSalaryTemplateItemDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
