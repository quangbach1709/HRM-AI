package com.hrm.backend.controller;

import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.service.FileDescriptionService;
import com.hrm.backend.utils.HRConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/file-descriptions")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class FileDescriptionController {

    private final FileDescriptionService fileDescriptionService;

    @Autowired
    public FileDescriptionController(FileDescriptionService fileDescriptionService) {
        this.fileDescriptionService = fileDescriptionService;
    }

    @PostMapping
    @Secured({HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    public ResponseEntity<FileDescriptionDto> createFileDescription(@RequestParam("file") MultipartFile file) {
        FileDescriptionDto result = fileDescriptionService.saveFile(file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Secured({HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    public ResponseEntity<FileDescriptionDto> getFileDescription(@PathVariable UUID id) {
        FileDescriptionDto result = fileDescriptionService.getById(id);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @Secured({HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    public ResponseEntity<Void> deleteFileDescription(@PathVariable UUID id) {
        fileDescriptionService.deleteById(id);
        return ResponseEntity.ok().build();
    }
    
    
}
