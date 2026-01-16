package com.hrm.backend.controller;

import com.hrm.backend.dto.CandidateDto;
import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.service.CandidateService;
import com.hrm.backend.service.FileDescriptionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Public Candidate API - accessible without authentication
 * For external applicants to submit and update their applications
 */
@RestController
@RequestMapping("/api/public/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class PublicCandidateController {

    private final CandidateService candidateService;
    private final FileDescriptionService fileDescriptionService;

    /**
     * Create new candidate application (public)
     */
    @PostMapping
    public ResponseEntity<CandidateDto> create(@Valid @RequestBody CandidateDto dto) {
        CandidateDto created = candidateService.publicCreate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get candidate by ID (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.getById(id));
    }

    /**
     * Update candidate application (public - no score update allowed)
     * Requires candidateCode + phoneNumber verification
     */
    @PutMapping("/{id}")
    public ResponseEntity<CandidateDto> update(@PathVariable UUID id, @Valid @RequestBody CandidateDto dto) {
        return ResponseEntity.ok(candidateService.publicUpdate(id, dto));
    }

    /**
     * Find candidate by code and phone for edit verification
     */
    @PostMapping("/verify")
    public ResponseEntity<CandidateDto> verify(@RequestBody Map<String, String> request) {
        String candidateCode = request.get("candidateCode");
        String phoneNumber = request.get("phoneNumber");

        if (candidateCode == null || phoneNumber == null) {
            throw new IllegalArgumentException("candidateCode and phoneNumber are required");
        }

        CandidateDto candidate = candidateService.findByCandidateCodeAndPhone(candidateCode, phoneNumber);
        if (candidate == null) {
            throw new EntityNotFoundException("Candidate not found or phone number does not match");
        }
        return ResponseEntity.ok(candidate);
    }

    /**
     * Upload CV file (public) - supports PDF and Word documents
     */
    @PostMapping("/upload-cv")
    public ResponseEntity<FileDescriptionDto> uploadCv(@RequestParam("file") MultipartFile file) {
        // Validate file type
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();

        boolean isValidType = contentType != null && (contentType.equals("application/pdf") ||
                contentType.equals("application/msword") ||
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));

        boolean isValidExtension = originalFilename != null && (originalFilename.toLowerCase().endsWith(".pdf") ||
                originalFilename.toLowerCase().endsWith(".doc") ||
                originalFilename.toLowerCase().endsWith(".docx"));

        if (!isValidType && !isValidExtension) {
            throw new IllegalArgumentException("Only PDF and Word documents are allowed");
        }

        FileDescriptionDto result = fileDescriptionService.saveFile(file);
        return ResponseEntity.ok(result);
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
