package com.hrm.backend.controller;

import com.hrm.backend.dto.RecruitmentRequestDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchRecruitmentRequestDto;
import com.hrm.backend.service.RecruitmentRequestService;
import com.hrm.backend.utils.HRConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment-requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecruitmentRequestController {

    private final RecruitmentRequestService service;

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<RecruitmentRequestDto>> search(
            @RequestBody SearchRecruitmentRequestDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @GetMapping("/{id}")
    public ResponseEntity<RecruitmentRequestDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping
    public ResponseEntity<RecruitmentRequestDto> create(@RequestBody RecruitmentRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PutMapping("/{id}")
    public ResponseEntity<RecruitmentRequestDto> update(
            @PathVariable UUID id,
            @RequestBody RecruitmentRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @GetMapping("/all")
    public ResponseEntity<List<RecruitmentRequestDto>> getAllList() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_ADMIN, HRConstants.ROLE_MANAGER, HRConstants.ROLE_HR })
    @PostMapping("/export")
    public ResponseEntity<List<RecruitmentRequestDto>> export(
            @RequestBody SearchRecruitmentRequestDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }
}
