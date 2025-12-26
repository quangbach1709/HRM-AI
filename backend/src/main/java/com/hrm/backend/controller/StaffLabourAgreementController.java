package com.hrm.backend.controller;

import com.hrm.backend.dto.StaffLabourAgreementDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchStaffLabourAgreementDto;
import com.hrm.backend.service.StaffLabourAgreementService;

import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/labour-agreements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffLabourAgreementController {

    private final StaffLabourAgreementService service;

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<StaffLabourAgreementDto>> search(
            @RequestBody SearchStaffLabourAgreementDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<StaffLabourAgreementDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @GetMapping("/{id}")
    public ResponseEntity<StaffLabourAgreementDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER , HRConstants.ROLE_HR })
    @PostMapping
    public ResponseEntity<StaffLabourAgreementDto> create(@RequestBody StaffLabourAgreementDto dto) {
        StaffLabourAgreementDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER , HRConstants.ROLE_HR })
    @PutMapping("/{id}")
    public ResponseEntity<StaffLabourAgreementDto> update(@PathVariable UUID id,
            @RequestBody StaffLabourAgreementDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @GetMapping("/all")
    public ResponseEntity<List<StaffLabourAgreementDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/export")
    public ResponseEntity<List<StaffLabourAgreementDto>> export(@RequestBody SearchStaffLabourAgreementDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
