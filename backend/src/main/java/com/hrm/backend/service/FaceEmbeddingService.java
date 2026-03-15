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

    /** Used by attendance flow to call AI Service for liveness check + embedding extraction. */
    AIFaceVerificationResponse callAIService(List<MultipartFile> frames);

    /** Used by attendance flow to verify extracted embedding against registered face embeddings. */
    Boolean verifyFace(FaceEmbeddingDto dto);
}
