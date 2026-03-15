package com.hrm.backend.service.listener;

import com.hrm.backend.config.RabbitMQConfig;
import com.hrm.backend.dto.FaceEmbeddingMessage;
import com.hrm.backend.entity.FaceEmbedding;
import com.hrm.backend.entity.FileDescription;
import com.hrm.backend.entity.Person;
import com.hrm.backend.entity.User;
import com.hrm.backend.repository.FaceEmbeddingRepository;
import com.hrm.backend.repository.FileDescriptionRepository;
import com.hrm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Listener nhận message từ AI Service qua RabbitMQ sau khi AI xử lý đăng ký khuôn mặt.
 * Tạo bản ghi FaceEmbedding metadata trong DB backend:
 *   - person (resolve từ username)
 *   - imageUrl (tạo FileDescription trỏ về MinIO URL đã upload bởi AI Service)
 *   - isActive = false (chờ HR duyệt)
 *   - aiEmbeddingId (tham chiếu đến bản ghi vector bên AI Service)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FaceEmbeddingListener {

    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FileDescriptionRepository fileDescriptionRepository;
    private final UserRepository userRepository;

    @RabbitListener(queues = RabbitMQConfig.FACE_EMBEDDING_QUEUE)
    @Transactional
    public void handleFaceEmbeddingRegistration(FaceEmbeddingMessage message) {
        log.info("Nhận message đăng ký khuôn mặt cho username={}, angle={}",
                message.getUsername(), message.getAngle());

        try {
            // 1. Resolve Person từ username
            Optional<User> userOpt = userRepository.findByUsername(message.getUsername());
            if (userOpt.isEmpty()) {
                log.error("Không tìm thấy user với username={}", message.getUsername());
                return;
            }
            Person person = userOpt.get().getPerson();
            if (person == null) {
                log.error("User username={} chưa có hồ sơ nhân viên (Person)", message.getUsername());
                return;
            }

            // 2. Tạo FileDescription trỏ đến ảnh đã được AI Service upload lên MinIO
            FileDescription fileDescription = new FileDescription();
            // Tách object key từ imageUrl hoặc dùng imageObjectKey
            String objectKey = message.getImageObjectKey();
            if (objectKey == null && message.getImageUrl() != null) {
                // Fallback: lấy phần path sau bucket name
                objectKey = message.getImageUrl();
            }
            fileDescription.setFilePath(objectKey);
            fileDescription.setName("face-" + message.getAngle() + "-" + message.getAiEmbeddingId());
            fileDescription.setContentType("image/jpeg");
            fileDescription.setExtension("jpg");
            FileDescription savedFile = fileDescriptionRepository.save(fileDescription);

            // 3. Tạo FaceEmbedding metadata
            FaceEmbedding faceEmbedding = new FaceEmbedding();
            faceEmbedding.setPerson(person);
            faceEmbedding.setImageUrl(savedFile);
            faceEmbedding.setActive(false);           // chờ HR duyệt
            faceEmbedding.setModelVersion(message.getModelVersion() != null ? message.getModelVersion() : "ArcFace_v1");
            faceEmbedding.setAngle(message.getAngle());
            faceEmbedding.setAiEmbeddingId(message.getAiEmbeddingId());

            faceEmbeddingRepository.save(faceEmbedding);

            log.info("Đã lưu FaceEmbedding metadata cho person={}, angle={}, aiEmbeddingId={}",
                    person.getId(), message.getAngle(), message.getAiEmbeddingId());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý message đăng ký khuôn mặt cho username={}: {}",
                    message.getUsername(), e.getMessage(), e);
            // Không throw lại để tránh requeue loop — log để xử lý thủ công nếu cần
        }
    }
}
