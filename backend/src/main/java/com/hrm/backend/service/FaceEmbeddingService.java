package com.hrm.backend.service;

import com.hrm.backend.dto.AIFaceVerificationResponse;
import com.hrm.backend.dto.FaceEmbeddingDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchFaceEmbeddingDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface FaceEmbeddingService {

    FaceEmbeddingDto saveOrUpdate(FaceEmbeddingDto dto);

    FaceEmbeddingDto getById(UUID id);

    void deleteById(UUID id);

    PageResponse<FaceEmbeddingDto> searchFaceEmbeddings(SearchFaceEmbeddingDto dto);

    List<FaceEmbeddingDto> getByPersonId(UUID personId);

    /**
     * HR duyệt khuôn mặt:
     * 1. Cập nhật isActive = true trong DB backend
     * 2. Publish RabbitMQ message để AI Service cập nhật is_active = true trong DB của nó
     *
     * @param id         ID bản ghi FaceEmbedding phía backend
     * @param approvedBy Username của HR thực hiện duyệt (lấy từ SecurityContext)
     * @return DTO đã được cập nhật
     */
    FaceEmbeddingDto approveFace(UUID id, String approvedBy);

    /** Used by attendance flow to call AI Service for liveness check + embedding extraction. */
    AIFaceVerificationResponse callAIService(List<MultipartFile> frames);

    /** Used by attendance flow to verify extracted embedding against registered face embeddings. */
    Boolean verifyFace(FaceEmbeddingDto dto);
}
