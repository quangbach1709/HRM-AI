package com.hrm.backend.controller;


import com.hrm.backend.dto.StaffDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchStaffDto;
import com.hrm.backend.service.StaffService;
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
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<PageResponse<StaffDto>> search(@RequestBody SearchStaffDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @PostMapping("/paging")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<PageResponse<StaffDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @GetMapping
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
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
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<StaffDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<StaffDto> create(@RequestBody StaffDto dto) {
        StaffDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<StaffDto> update(@PathVariable UUID id, @RequestBody StaffDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER" })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<List<StaffDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping("/export")
    @Secured({ "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_HR" })
    public ResponseEntity<List<StaffDto>> export(@RequestBody SearchStaffDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
