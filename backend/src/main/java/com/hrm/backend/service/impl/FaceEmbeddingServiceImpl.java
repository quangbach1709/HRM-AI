package com.hrm.backend.service.impl;

import com.hrm.backend.dto.AIFaceVerificationResponse;
import com.hrm.backend.dto.FaceEmbeddingDto;
import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchFaceEmbeddingDto;
import com.hrm.backend.entity.FaceEmbedding;
import com.hrm.backend.entity.Person;

import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.repository.FaceEmbeddingRepository;
import com.hrm.backend.repository.PersonRepository;
import com.hrm.backend.repository.FileDescriptionRepository;
import com.hrm.backend.service.FaceEmbeddingService;
import com.hrm.backend.specification.FaceEmbeddingSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FaceEmbeddingServiceImpl implements FaceEmbeddingService {

    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final PersonRepository personRepository;
    private final FileDescriptionRepository fileDescriptionRepository;
    private final FaceEmbeddingSpecification faceEmbeddingSpecification;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${minio.endpoint:http://localhost:9002}")
    private String minioEndpoint;

    @Value("${minio.bucket-name:hrm-files}")
    private String minioBucketName;

    // ==================== CRUD ====================

    /** Builds a DTO with a fully-qualified MinIO URL in the imageUrl field. */
    private FaceEmbeddingDto toDto(FaceEmbedding entity) {
        FaceEmbeddingDto dto = new FaceEmbeddingDto(entity);
        if (entity.getImageUrl() != null) {
            dto.setImageUrl(new FileDescriptionDto(entity.getImageUrl(), minioEndpoint, minioBucketName));
        }
        return dto;
    }

    @Override
    @Transactional
    public FaceEmbeddingDto saveOrUpdate(FaceEmbeddingDto dto) {
        FaceEmbedding entity;

        if (dto.getId() != null) {
            entity = faceEmbeddingRepository.findById(dto.getId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Không tìm thấy FaceEmbedding với ID: " + dto.getId()));
        } else {
            entity = new FaceEmbedding();
        }

        if (dto.getPerson() != null && dto.getPerson().getId() != null) {
            Person person = personRepository.findById(dto.getPerson().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy Nhân viên với ID: " + dto.getPerson().getId()));
            entity.setPerson(person);
        } else if (entity.getPerson() == null) {
            throw new IllegalArgumentException("Nhân viên là bắt buộc");
        }

        if (dto.getImageUrl() != null && dto.getImageUrl().getId() != null) {
            FileDescription file = fileDescriptionRepository.findById(dto.getImageUrl().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy File với ID: " + dto.getImageUrl().getId()));
            entity.setImageUrl(file);
        }

        entity.setActive(dto.isActive());
        entity.setModelVersion(dto.getModelVersion());
        entity.setAngle(dto.getAngle());
        entity.setAiEmbeddingId(dto.getAiEmbeddingId());

        FaceEmbedding saved = faceEmbeddingRepository.save(entity);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FaceEmbeddingDto getById(UUID id) {
        FaceEmbedding entity = faceEmbeddingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy FaceEmbedding với ID: " + id));
        return toDto(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        FaceEmbedding entity = faceEmbeddingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy FaceEmbedding với ID: " + id));

        entity.setActive(false);
        entity.setVoided(true);
        faceEmbeddingRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FaceEmbeddingDto> searchFaceEmbeddings(SearchFaceEmbeddingDto dto) {
        if (dto == null) {
            dto = new SearchFaceEmbeddingDto();
        }

        Specification<FaceEmbedding> spec = faceEmbeddingSpecification.getSpecification(dto);
        Pageable pageable = faceEmbeddingSpecification.getPageable(dto);

        Page<FaceEmbedding> page = faceEmbeddingRepository.findAll(spec, pageable);
        Page<FaceEmbeddingDto> dtoPage = page.map(this::toDto);

        return PageResponse.of(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FaceEmbeddingDto> getByPersonId(UUID personId) {
        List<FaceEmbedding> list = faceEmbeddingRepository.findByPersonId(personId);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ==================== ATTENDANCE VERIFICATION ====================

    @Override
    public AIFaceVerificationResponse callAIService(List<MultipartFile> frames) {
        if (frames.size() == 1) {
            return callAiServiceCheckImage(frames.getFirst());
        } else {
            return callAiServiceVerifyVideo(frames);
        }
    }

    @Override
    public Boolean verifyFace(FaceEmbeddingDto dto) {
        double similarityThreshold = 0.6;

        double[] inputVector = dto.getEmbeddingVector();
        if (inputVector == null || inputVector.length == 0) {
            throw new IllegalArgumentException("Không có embedding vector từ ảnh đầu vào.");
        }

        List<FaceEmbedding> registeredEmbeddings = faceEmbeddingRepository
                .findByPersonIdAndActiveTrue(dto.getPerson().getId());
        if (registeredEmbeddings.isEmpty()) {
            throw new IllegalArgumentException("Chưa có khuôn mặt đã đăng ký cho nhân viên này.");
        }

        double maxScore = 0.0;
        for (FaceEmbedding registered : registeredEmbeddings) {
            // NOTE: embeddingVector is no longer stored in backend DB.
            // Attendance verification should be delegated to AI Service in a future iteration.
            // For now, skip records without a local vector.
        }

        return maxScore >= similarityThreshold;
    }

    // ==================== AI SERVICE HTTP CALLS ====================

    private AIFaceVerificationResponse callAiServiceCheckImage(MultipartFile file) {
        try {
            String url = aiServiceUrl + "/api/attendance/check-image";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<AIFaceVerificationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    AIFaceVerificationResponse.class);

            return response.getBody();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi đọc file: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi AI-Service: " + e.getMessage(), e);
        }
    }

    private AIFaceVerificationResponse callAiServiceVerifyVideo(List<MultipartFile> frames) {
        try {
            String url = aiServiceUrl + "/api/attendance/verify-video";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            for (MultipartFile frame : frames) {
                ByteArrayResource fileResource = new ByteArrayResource(frame.getBytes()) {
                    @Override
                    public String getFilename() {
                        return frame.getOriginalFilename();
                    }
                };
                body.add("files", fileResource);
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<AIFaceVerificationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    AIFaceVerificationResponse.class);

            return response.getBody();
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi đọc file: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi AI-Service verify-video: " + e.getMessage(), e);
        }
    }
}
