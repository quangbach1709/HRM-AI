package com.hrm.backend.controller;

import com.hrm.backend.dto.StaffDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchStaffDto;
import com.hrm.backend.service.StaffService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService service;

    @PostMapping("/search")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<PageResponse<StaffDto>> search(@RequestBody SearchStaffDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @GetMapping
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<PageResponse<StaffDto>> getAll(
            @RequestParam(defaultValue = "0") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        SearchStaffDto dto = new SearchStaffDto();
        dto.setPageIndex(pageIndex);
        dto.setPageSize(pageSize);
        dto.setKeyword(keyword);
        return ResponseEntity.ok(service.search(dto));
    }

    @GetMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<StaffDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<StaffDto> create(@RequestBody StaffDto dto) {
        StaffDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<StaffDto> update(@PathVariable UUID id, @RequestBody StaffDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    public ResponseEntity<List<StaffDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/current")
    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    public ResponseEntity<StaffDto> getCurrentStaff() {
        return ResponseEntity.ok(service.getCurrentStaff());
    }

    @PostMapping("/export")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<List<StaffDto>> export(@RequestBody SearchStaffDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
