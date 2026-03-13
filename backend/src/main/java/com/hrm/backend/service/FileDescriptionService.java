package com.hrm.backend.service;

import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.entity.FileDescription;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface FileDescriptionService {
    void deleteById(UUID id);

    FileDescriptionDto getById(UUID id);

    FileDescriptionDto saveFile(MultipartFile file);

    FileDescription getEntityById(UUID id);

    /** Stream file qua backend (dùng cho /download) */
    Resource getFileAsResource(UUID id);

    /** Presigned URL hết hạn sau 1 giờ (dùng cho /view khi cần bảo mật) */
    String getPresignedUrl(UUID id);

    /** Public URL trực tiếp tới MinIO (dùng khi bucket có policy public-read) */
    String getPublicUrl(UUID id);
}
