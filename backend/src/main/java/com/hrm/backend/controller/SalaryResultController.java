package com.hrm.backend.controller;

import com.hrm.backend.dto.SalaryResultDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchSalaryResultDto;
import com.hrm.backend.service.SalaryResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salary-results")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaryResultController {

    private final SalaryResultService service;

    @PostMapping("/search")
    @Secured({ "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_HR" })
    public ResponseEntity<PageResponse<SalaryResultDto>> search(
            @RequestBody SearchSalaryResultDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

        @GetMapping("/{id}")
    @Secured({ "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_HR" })
    public ResponseEntity<SalaryResultDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    @Secured({ "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_HR" })
    public ResponseEntity<SalaryResultDto> create(@RequestBody SalaryResultDto dto) {
        SalaryResultDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Secured({ "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_HR" })
    public ResponseEntity<SalaryResultDto> update(
            @PathVariable UUID id,
            @RequestBody SalaryResultDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Secured({ "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_HR" })
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<SalaryResultDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping("/export")
    @Secured({ "ROLE_MANAGER", "ROLE_ADMIN", "ROLE_HR" })
    public ResponseEntity<List<SalaryResultDto>> export(
            @RequestBody SearchSalaryResultDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
