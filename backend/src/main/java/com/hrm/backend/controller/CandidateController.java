package com.hrm.backend.controller;

import com.hrm.backend.dto.CandidateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchCandidateDto;
import com.hrm.backend.service.CandidateService;
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
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class CandidateController {

    private final CandidateService service;

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<CandidateDto>> search(@RequestBody SearchCandidateDto dto) {
        return ResponseEntity.ok(service.search(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @PostMapping("/paging")
    public ResponseEntity<PageResponse<CandidateDto>> paging(@RequestBody SearchDto dto) {
        return ResponseEntity.ok(service.paging(dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping
    public ResponseEntity<CandidateDto> create(@Valid @RequestBody CandidateDto dto) {
        CandidateDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PutMapping("/{id}")
    public ResponseEntity<CandidateDto> update(@PathVariable UUID id, @Valid @RequestBody CandidateDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        service.delete(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Deleted candidate successfully");
        return ResponseEntity.ok(response);
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping("/all")
    public ResponseEntity<List<CandidateDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping("/export")
    public ResponseEntity<List<CandidateDto>> export(@RequestBody SearchCandidateDto dto) {
        return ResponseEntity.ok(service.exportToExcel(dto));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
