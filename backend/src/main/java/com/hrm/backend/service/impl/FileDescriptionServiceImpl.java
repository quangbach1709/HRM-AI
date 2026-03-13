package com.hrm.backend.service.impl;

import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.repository.FileDescriptionRepository;
import com.hrm.backend.service.FileDescriptionService;
import io.minio.*;
import io.minio.http.Method;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class FileDescriptionServiceImpl implements FileDescriptionService {

    private final FileDescriptionRepository fileDescriptionRepository;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    // -----------------------------------------------------------------------
    // CRUD
    // -----------------------------------------------------------------------

    @Override
    public void deleteById(UUID id) {
        FileDescription entity = fileDescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileDescription with ID " + id + " not found."));

        // Xoá object khỏi MinIO
        if (entity.getFilePath() != null) {
            try {
                minioClient.removeObject(RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(entity.getFilePath())
                        .build());
            } catch (Exception e) {
                // Log lỗi nhưng vẫn tiếp tục soft-delete record trong DB
                throw new RuntimeException("Không thể xoá file khỏi MinIO: " + e.getMessage(), e);
            }
        }

        entity.setVoided(true);
        fileDescriptionRepository.save(entity);
    }

    @Override
    public FileDescriptionDto getById(UUID id) {
        FileDescription entity = fileDescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileDescription with ID " + id + " not found."));
        return mapToDto(entity);
    }

    private FileDescriptionDto mapToDto(FileDescription entity) {
        if (entity == null) return null;
        FileDescriptionDto dto = new FileDescriptionDto(entity);
        if (entity.getFilePath() != null) {
            dto.setUrl(getPublicUrl(entity.getId()));
        }
        return dto;
    }

    @Override
    public FileDescription getEntityById(UUID id) {
        return fileDescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileDescription with ID " + id + " not found."));
    }

    // -----------------------------------------------------------------------
    // Upload
    // -----------------------------------------------------------------------

    @Override
    public FileDescriptionDto saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is null or empty");
        }

        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1);
        }
        // Object key trong MinIO: UUID + extension
        String objectKey = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi upload file lên MinIO", e);
        }

        FileDescription entity = new FileDescription();
        entity.setName(originalFileName);
        entity.setFilePath(objectKey);   // lưu object key (không phải full URL)
        entity.setExtension(extension);
        entity.setContentSize(file.getSize());
        entity.setContentType(file.getContentType());

        entity = fileDescriptionRepository.saveAndFlush(entity);
        return mapToDto(entity);
    }

    // -----------------------------------------------------------------------
    // Download / Stream (dùng cho endpoint /download — proxy qua backend)
    // -----------------------------------------------------------------------

    @Override
    public Resource getFileAsResource(UUID id) {
        FileDescription entity = getEntityById(id);
        try {
            InputStream stream = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(entity.getFilePath())
                    .build());
            return new InputStreamResource(stream);
        } catch (Exception e) {
            throw new RuntimeException("Không thể đọc file từ MinIO: " + entity.getFilePath(), e);
        }
    }

    // -----------------------------------------------------------------------
    // Presigned URL (dùng cho endpoint /view — frontend load trực tiếp)
    // -----------------------------------------------------------------------

    @Override
    public String getPresignedUrl(UUID id) {
        FileDescription entity = getEntityById(id);
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(bucketName)
                    .object(entity.getFilePath())
                    .method(Method.GET)
                    .expiry(1, TimeUnit.HOURS)
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo presigned URL cho file: " + entity.getFilePath(), e);
        }
    }

    /**
     * Trả về public URL trực tiếp của file (chỉ hoạt động khi bucket có policy public-read).
     * Frontend có thể dùng URL này để hiển thị ảnh / PDF mà không cần qua backend.
     */
    @Override
    public String getPublicUrl(UUID id) {
        FileDescription entity = getEntityById(id);
        return minioEndpoint + "/" + bucketName + "/" + entity.getFilePath();
    }
}
