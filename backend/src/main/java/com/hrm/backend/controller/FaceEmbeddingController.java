package com.hrm.backend.controller;

import com.hrm.backend.dto.FaceEmbeddingDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchFaceEmbeddingDto;
import com.hrm.backend.service.FaceEmbeddingService;
import com.hrm.backend.utils.HRConstants;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/face-embeddings")
public class FaceEmbeddingController {

    @Autowired
    private FaceEmbeddingService faceEmbeddingService;

    // Search with paging
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @PostMapping("/search")
    public ResponseEntity<PageResponse<FaceEmbeddingDto>> searchFaceEmbeddings(
            @RequestBody SearchFaceEmbeddingDto dto) {
        PageResponse<FaceEmbeddingDto> response = faceEmbeddingService.searchFaceEmbeddings(dto);
        return ResponseEntity.ok(response);
    }

    // Get by ID
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping("/{id}")
    public ResponseEntity<FaceEmbeddingDto> getById(@PathVariable UUID id) {
        FaceEmbeddingDto dto = faceEmbeddingService.getById(id);
        return ResponseEntity.ok(dto);
    }

    // Get all by Person ID
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    @GetMapping("/person/{personId}")
    public ResponseEntity<List<FaceEmbeddingDto>> getByPersonId(@PathVariable UUID personId) {
        List<FaceEmbeddingDto> list = faceEmbeddingService.getByPersonId(personId);
        return ResponseEntity.ok(list);
    }

    // Create (HR/Admin thủ công nếu cần)
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PostMapping
    public ResponseEntity<FaceEmbeddingDto> create(@Valid @RequestBody FaceEmbeddingDto dto) {
        FaceEmbeddingDto created = faceEmbeddingService.saveOrUpdate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Update (HR duyệt khuôn mặt: set isActive = true)
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @PutMapping("/{id}")
    public ResponseEntity<FaceEmbeddingDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody FaceEmbeddingDto dto) {
        dto.setId(id);
        FaceEmbeddingDto updated = faceEmbeddingService.saveOrUpdate(dto);
        return ResponseEntity.ok(updated);
    }

    // Delete (Soft delete)
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable UUID id) {
        faceEmbeddingService.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa FaceEmbedding thành công");
        return ResponseEntity.ok(response);
    }

    // Exception Handlers
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
