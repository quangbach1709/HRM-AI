package com.hrm.backend.service.impl;

import com.google.api.gax.rpc.NotFoundException;
import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.repository.FileDescriptionRepository;
import com.hrm.backend.service.FileDescriptionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileDescriptionServiceImpl implements FileDescriptionService {

    private final FileDescriptionRepository fileDescriptionRepository;
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";


    @Autowired
    public FileDescriptionServiceImpl(FileDescriptionRepository fileDescriptionRepository) {
        this.fileDescriptionRepository = fileDescriptionRepository;
    }

    @Override
    public void deleteById(UUID id) {
        FileDescription entity = fileDescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileDescription with ID " + id + " not found."));
        entity.setVoided(true);
        fileDescriptionRepository.save(entity);
    }

    @Override
    public FileDescriptionDto getById(UUID id) {
        FileDescription entity = fileDescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileDescription with ID " + id + " not found."));
        // Convert entity to DTO (implementation not shown)
        return new FileDescriptionDto(entity);
    }

    @Override
    public FileDescriptionDto saveFile(MultipartFile file) {
        FileDescription entity = null;

        if (file != null && !file.isEmpty()) {
            // Xử lý upload file mới
            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1);
            String uuid = UUID.randomUUID().toString();
            String fileName = uuid + "." + extension;
            String filePath = UPLOAD_DIR + fileName;

            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) uploadDir.mkdirs();
                file.transferTo(new File(filePath));
                entity = new FileDescription();
                entity.setName(originalFileName);
                entity.setFilePath(fileName);
                entity.setExtension(extension);
                entity.setContentSize(file.getSize());
                entity.setContentType(file.getContentType());

                entity = fileDescriptionRepository.save(entity);
                return new FileDescriptionDto(entity);
            } catch (IOException e) {
                throw new RuntimeException("Error while uploading file", e);
            }
        } else {
            throw new IllegalArgumentException("File is null or empty");
        }
    }

    @Override
    public FileDescription getEntityById(UUID id) {
        return fileDescriptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("FileDescription with ID " + id + " not found."));
    }
}
