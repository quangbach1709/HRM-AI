package com.hrm.backend.controller;

import com.hrm.backend.dto.StaffWorkScheduleDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffWorkScheduleDto;
import com.hrm.backend.service.StaffWorkScheduleService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff-work-schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffWorkScheduleController {

    private final StaffWorkScheduleService service;

    // ==================== PAGINATION ====================

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<StaffWorkScheduleDto>> search(
            @RequestBody SearchStaffWorkScheduleDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<StaffWorkScheduleDto>> paging(
            @RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    // ==================== CRUD ====================

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @GetMapping("/{id}")
    public ResponseEntity<StaffWorkScheduleDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping
    public ResponseEntity<StaffWorkScheduleDto> create(@RequestBody StaffWorkScheduleDto dto) {
        StaffWorkScheduleDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PutMapping("/{id}")
    public ResponseEntity<StaffWorkScheduleDto> update(
            @PathVariable UUID id,
            @RequestBody StaffWorkScheduleDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== ADDITIONAL ====================

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @GetMapping("/all")
    public ResponseEntity<List<StaffWorkScheduleDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/export")
    public ResponseEntity<List<StaffWorkScheduleDto>> export(
            @RequestBody SearchStaffWorkScheduleDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
