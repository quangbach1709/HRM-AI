package com.hrm.backend.controller;

import com.hrm.backend.dto.SystemConfigDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSystemConfigDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.service.SystemConfigService;
import com.hrm.backend.utils.HRConstants;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/system-configs")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class SystemConfigController {

    private final SystemConfigService service;

    // ==================== PAGINATION ====================

    @Secured({ HRConstants.ROLE_ADMIN })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<SystemConfigDto>> search(@RequestBody SearchSystemConfigDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }


    @Secured({ HRConstants.ROLE_ADMIN })
    @GetMapping
    public ResponseEntity<PageResponse<SystemConfigDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean voided,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String configKey,
            @RequestParam(required = false) Integer configType) {

        SearchSystemConfigDto dto = new SearchSystemConfigDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        dto.setVoided(voided);
        dto.setSortBy(sortBy);
        dto.setSortDirection(sortDirection);
        dto.setConfigKey(configKey);
        dto.setConfigType(configType);

        return ResponseEntity.ok(service.search(dto));
    }

    // ==================== CRUD ====================

    @Secured({ HRConstants.ROLE_ADMIN })
    @GetMapping("/all")
    public ResponseEntity<List<SystemConfigDto>> getAllList() {
        return ResponseEntity.ok(service.getAllConfigs());
    }

    @Secured({ HRConstants.ROLE_ADMIN })
    @GetMapping("/{id}")
    public ResponseEntity<SystemConfigDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_ADMIN })
    @GetMapping("/key/{configKey}")
    public ResponseEntity<SystemConfigDto> getByKey(@PathVariable String configKey) {
        return ResponseEntity.ok(service.getByKey(configKey));
    }

    @Secured({ HRConstants.ROLE_ADMIN })
    @PostMapping
    public ResponseEntity<SystemConfigDto> create(@Valid @RequestBody SystemConfigDto dto) {
        SystemConfigDto created = service.saveOrUpdate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_ADMIN })
    @PutMapping("/{id}")
    public ResponseEntity<SystemConfigDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody SystemConfigDto dto) {
        dto.setId(id);
        SystemConfigDto updated = service.saveOrUpdate(dto);
        return ResponseEntity.ok(updated);
    }

    @Secured({ HRConstants.ROLE_ADMIN })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        service.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa cấu hình thành công");
        return ResponseEntity.ok(response);
    }

    // ===== EXCEPTION HANDLERS =====

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
