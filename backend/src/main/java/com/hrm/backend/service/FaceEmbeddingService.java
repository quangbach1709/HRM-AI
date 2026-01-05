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

    List<FaceEmbeddingDto> registerFace(List<MultipartFile> frames);

    //Kiểm tra khuôn mặt có trùng khớp với khuôn mặt đã đăng ký không
    Boolean verifyFace(FaceEmbeddingDto dto);


    AIFaceVerificationResponse callAIService(List<MultipartFile> frames);
}
