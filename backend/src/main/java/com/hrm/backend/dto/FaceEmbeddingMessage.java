package com.hrm.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Message nhận từ AI Service qua RabbitMQ sau khi xử lý đăng ký khuôn mặt.
 * AI Service gửi thông tin này để Backend Java tạo bản ghi FaceEmbedding metadata
 * (không chứa embedding vector — vector lưu ở DB của AI Service).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FaceEmbeddingMessage {

    /** ID của bản ghi FaceEmbedding trong DB của AI Service */
    private String aiEmbeddingId;

    /** Username của nhân viên (từ JWT, inject bởi API Gateway) */
    private String username;

    /** URL công khai truy cập ảnh từ MinIO (AI Service đã upload) */
    private String imageUrl;

    /** Object key trong MinIO bucket (ví dụ: face-embeddings/<uuid>.jpg) */
    private String imageObjectKey;

    /** Góc chụp: front / left / right */
    private String angle;

    /** Phiên bản model AI (ví dụ: ArcFace_v1) */
    private String modelVersion;

    /** Trạng thái: false = chờ HR duyệt */
    private boolean isActive;

    public FaceEmbeddingMessage() {}

    public String getAiEmbeddingId() { return aiEmbeddingId; }
    public void setAiEmbeddingId(String aiEmbeddingId) { this.aiEmbeddingId = aiEmbeddingId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageObjectKey() { return imageObjectKey; }
    public void setImageObjectKey(String imageObjectKey) { this.imageObjectKey = imageObjectKey; }

    public String getAngle() { return angle; }
    public void setAngle(String angle) { this.angle = angle; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
