package com.hrm.backend.service;

import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.entity.FileDescription;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface FileDescriptionService {
    void deleteById(UUID id);

    FileDescriptionDto getById(UUID id);

    FileDescriptionDto saveFile(MultipartFile file);

    FileDescription getEntityById(UUID id);
}
