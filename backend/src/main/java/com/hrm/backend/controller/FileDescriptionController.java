package com.hrm.backend.controller;

import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.service.FileDescriptionService;
import com.hrm.backend.utils.HRConstants;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/file-descriptions")
public class FileDescriptionController {

    private final FileDescriptionService fileDescriptionService;

    public FileDescriptionController(FileDescriptionService fileDescriptionService) {
        this.fileDescriptionService = fileDescriptionService;
    }

    @PostMapping
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    public ResponseEntity<FileDescriptionDto> createFileDescription(@RequestParam("file") MultipartFile file) {
        FileDescriptionDto result = fileDescriptionService.saveFile(file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    public ResponseEntity<FileDescriptionDto> getFileDescription(@PathVariable UUID id) {
        FileDescriptionDto result = fileDescriptionService.getById(id);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR })
    public ResponseEntity<Void> deleteFileDescription(@PathVariable UUID id) {
        fileDescriptionService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Lấy public URL của file trong MinIO.
     * Frontend dùng URL này để hiển thị ảnh / PDF trực tiếp (không proxy qua backend).
     * Public endpoint — không cần xác thực (cho phép <img src="..."> hoạt động).
     */
    @GetMapping("/{id}/url")
    public ResponseEntity<String> getFileUrl(@PathVariable UUID id) {
        String url = fileDescriptionService.getPublicUrl(id);
        return ResponseEntity.ok(url);
    }

    /**
     * View file inline (redirect tới presigned URL MinIO — hết hạn sau 1 giờ).
     * Dùng khi cần bảo mật hơn (URL tạm thời).
     * Public endpoint — không cần xác thực (cho phép <img src="..."> hoạt động).
     */
    @GetMapping("/{id}/view")
    public ResponseEntity<Void> viewFile(@PathVariable UUID id) {
        String presignedUrl = fileDescriptionService.getPresignedUrl(id);
        return ResponseEntity.status(302)
                .location(URI.create(presignedUrl))
                .build();
    }

    /**
     * Download file dưới dạng stream qua backend (attachment).
     */
    @GetMapping("/{id}/download")
    @Secured({ HRConstants.ROLE_MANAGER, HRConstants.ROLE_ADMIN, HRConstants.ROLE_HR, HRConstants.ROLE_USER })
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id) {
        FileDescriptionDto fileInfo = fileDescriptionService.getById(id);
        Resource resource = fileDescriptionService.getFileAsResource(id);

        String contentType = fileInfo.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileInfo.getName() + "\"")
                .body(resource);
    }
}
