package com.hrm.backend.service.impl;

import com.hrm.backend.dto.AIFaceVerificationResponse;
import com.hrm.backend.dto.FaceEmbeddingDto;
import com.hrm.backend.dto.FileDescriptionDto;
import com.hrm.backend.dto.PersonDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchFaceEmbeddingDto;
import com.hrm.backend.entity.FaceEmbedding;
import com.hrm.backend.entity.Person;

import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.repository.FaceEmbeddingRepository;
import com.hrm.backend.repository.PersonRepository;
import com.hrm.backend.repository.FileDescriptionRepository;
import com.hrm.backend.service.FaceEmbeddingService;
import com.hrm.backend.service.FileDescriptionService;
import com.hrm.backend.service.PersonService;
import com.hrm.backend.service.UserService;
import com.hrm.backend.specification.FaceEmbeddingSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.checkerframework.checker.nullness.qual.NonNull;

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
import java.util.ArrayList;
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

    private final FileDescriptionService fileDescriptionService;

    private final FaceEmbeddingSpecification faceEmbeddingSpecification;

    private final RestTemplate restTemplate;

    private final PersonService personService;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    // Ngưỡng tối thiểu để xác định khuôn mặt khớp
    private static final double SIMILARITY_THRESHOLD = 0.6;
    // Ngưỡng phát hiện gian lận (replay attack) - nếu giống quá 99% thì coi là dùng
    // lại ảnh cũ
    private static final double REPLAY_ATTACK_THRESHOLD = 0.99;

    @Override
    @Transactional
    public FaceEmbeddingDto saveOrUpdate(FaceEmbeddingDto dto) {
        FaceEmbedding entity;

        if (dto.getId() != null) {
            // Update
            entity = faceEmbeddingRepository.findById(dto.getId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Không tìm thấy FaceEmbedding với ID: " + dto.getId()));
        } else {
            // Create
            entity = new FaceEmbedding();
        }

        // Set Person
        if (dto.getPerson() != null && dto.getPerson().getId() != null) {
            Person person = personRepository.findById(dto.getPerson().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy Nhân viên với ID: " + dto.getPerson().getId()));
            entity.setPerson(person);
        } else if (entity.getPerson() == null) {
            throw new IllegalArgumentException("Nhân viên là bắt buộc");
        }

        // Set Image URL (FileDescription)
        if (dto.getImageUrl() != null && dto.getImageUrl().getId() != null) {
            FileDescription file = fileDescriptionRepository.findById(dto.getImageUrl().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Không tìm thấy File với ID: " + dto.getImageUrl().getId()));
            entity.setImageUrl(file);
        }

        entity.setEmbeddingVector(dto.getEmbeddingVector());
        entity.setActive(dto.isActive());
        entity.setModelVersion(dto.getModelVersion());

        FaceEmbedding saved = faceEmbeddingRepository.save(entity);
        return new FaceEmbeddingDto(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public FaceEmbeddingDto getById(UUID id) {
        FaceEmbedding entity = faceEmbeddingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy FaceEmbedding với ID: " + id));
        return new FaceEmbeddingDto(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        FaceEmbedding entity = faceEmbeddingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy FaceEmbedding với ID: " + id));

        // Soft delete: set isActive = false
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
        Page<FaceEmbeddingDto> dtoPage = page.map(FaceEmbeddingDto::new);

        return PageResponse.of(dtoPage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FaceEmbeddingDto> getByPersonId(UUID personId) {
        List<FaceEmbedding> list = faceEmbeddingRepository.findByPersonId(personId);
        return list.stream().map(FaceEmbeddingDto::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<FaceEmbeddingDto> registerFace(List<MultipartFile> frames) {

        if (frames.size() < 3) {
            throw new IllegalArgumentException("Chụp đủ 3 goc mặt để đăng ký khuôn mặt");
        }

        List<FaceEmbeddingDto> registeredEmbeddings = new ArrayList<>();

        // 1. Lấy person của user hiện tại
        PersonDto person = personService.getCurrentPerson();

        // 2. Gọi AI-Service API
        for (MultipartFile frame : frames) {
            AIFaceVerificationResponse aiResponse = callAiServiceCheckImage(frame);

            // 3. Kiểm tra kết quả từ AI-Service
            if (aiResponse.getStatus() != 200 || aiResponse.getEmbeddingVector() == null) {
                throw new IllegalArgumentException("Ảnh không hợp lệ: " + aiResponse.getStatusDetail());
            }

            // 4. Chuyển đổi embeddingVector từ List<Double> sang double[]
            double[] embeddingArray = aiResponse.getEmbeddingVector().stream()
                    .mapToDouble(Double::doubleValue)
                    .toArray();

            FileDescriptionDto fileDescriptionDto = fileDescriptionService.saveFile(frame);
            // 5. Tạo và lưu FaceEmbedding entity
            FaceEmbeddingDto dto = new FaceEmbeddingDto();
            dto.setPerson(person);
            dto.setEmbeddingVector(embeddingArray);
            dto.setActive(false);
            dto.setModelVersion("ArcFace_v1");
            dto.setImageUrl(fileDescriptionDto);

            registeredEmbeddings.add(saveOrUpdate(dto));
        }

        return registeredEmbeddings;
    }



    @Override
    public Boolean verifyFace(FaceEmbeddingDto dto) {
        // Lấy vector đầu vào từ ảnh vừa chụp
        double[] inputVector = dto.getEmbeddingVector();
        if (inputVector == null || inputVector.length == 0) {
            throw new IllegalArgumentException("Không có embedding vector từ ảnh đầu vào.");
        }

        // Lấy danh sách các khuôn mặt đã đăng ký của nhân viên
        List<FaceEmbedding> registeredEmbeddings = faceEmbeddingRepository
                .findByPersonIdAndActiveTrue(dto.getPerson().getId());
        if (registeredEmbeddings.isEmpty()) {
            throw new IllegalArgumentException("Chưa có khuôn mặt đã đăng ký cho nhân viên này.");
        }

        // Bước 1 & 2: Tính Cosine Similarity với từng vector và tìm max
        double maxScore = 0.0;
        for (FaceEmbedding registered : registeredEmbeddings) {
            double[] storedVector = registered.getEmbeddingVector();
            if (storedVector != null && storedVector.length == inputVector.length) {
                double similarity = calculateCosineSimilarity(inputVector, storedVector);
                if (similarity > maxScore) {
                    maxScore = similarity;
                }
            }
        }

        // Bước 3: Kiểm tra Replay Attack (gian lận dùng lại ảnh cũ)
        if (maxScore > REPLAY_ATTACK_THRESHOLD) {
            throw new IllegalArgumentException("Phát hiện gian lận: Ảnh có độ trùng khớp quá cao (" +
                    String.format("%.2f%%", maxScore * 100) + "). Vui lòng chụp ảnh mới.");
        }

        // Bước 4: Kiểm tra ngưỡng
        return maxScore >= SIMILARITY_THRESHOLD;
    }

    @Override
    public AIFaceVerificationResponse callAIService(List<MultipartFile> frames) {
        if (frames.size() == 1){
            return callAiServiceCheckImage(frames.getFirst());
        } else {
            return callAiServiceVerifyVideo(frames);
        }
    }

    /**
     * Tính Cosine Similarity giữa 2 vector
     * Công thức: cos(θ) = (A · B) / (||A|| * ||B||)
     * Trong đó:
     * - A · B: tích vô hướng (dot product) của 2 vector
     * - ||A||, ||B||: độ dài (magnitude) của từng vector
     */
    private double calculateCosineSimilarity(double[] vectorA, double[] vectorB) {
        if (vectorA.length != vectorB.length) {
            throw new IllegalArgumentException("Hai vector phải có cùng số chiều.");
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        // Tránh chia cho 0
        if (magnitudeA == 0 || magnitudeB == 0) {
            return 0.0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    public AIFaceVerificationResponse callAiServiceCheckImage(MultipartFile file) {
        try {
            String url = aiServiceUrl + "/api/attendance/check-image";

            // Tạo multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Tạo file resource từ MultipartFile
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Gọi API
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

    /**
     * Gọi API /api/attendance/verify-video của AI-Service
     * 
     * @param frames Danh sách các frame từ video (ít nhất 5 frames)
     * @return AIFaceVerificationResponse chứa embeddingVector, status, statusDetail
     */
    public AIFaceVerificationResponse callAiServiceVerifyVideo(List<MultipartFile> frames) {
        try {
            String url = aiServiceUrl + "/api/attendance/verify-video";

            // Tạo multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = getMultiValueMapHttpEntity(frames, headers);

            // Gọi API
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

    private static @NonNull HttpEntity<MultiValueMap<String, Object>> getMultiValueMapHttpEntity(
            List<MultipartFile> frames, HttpHeaders headers) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Thêm tất cả frames vào request body
        for (MultipartFile frame : frames) {
            ByteArrayResource fileResource = new ByteArrayResource(frame.getBytes()) {
                @Override
                public String getFilename() {
                    return frame.getOriginalFilename();
                }
            };
            body.add("files", fileResource);
        }

        return new HttpEntity<>(body, headers);
    }
}
