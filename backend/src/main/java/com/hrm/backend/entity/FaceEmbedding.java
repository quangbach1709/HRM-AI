package com.hrm.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "tbl_face_embedding")
public class FaceEmbedding extends AuditableEntity{
    // Liên kết với nhân viên (1 nhân viên có nhiều mẫu khuôn mặt)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    // QUAN TRỌNG: Lưu vector đặc trưng (128 hoặc 512 chiều)
    // Map sang PostgreSQL kiểu: double precision[]
    @Column(name = "embedding_vector", columnDefinition = "float8[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private double[] embeddingVector;

    // Đường dẫn ảnh gốc lúc đăng ký (để audit/kiểm tra lại nếu cần)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_url_id")
    private FileDescription imageUrl;

    // Trạng thái (Ví dụ: true là đang dùng, false là khuôn mặt cũ đã xóa)
    @Column(name = "is_active")
    private boolean isActive = true;

    // Model version (Ví dụ: "ArcFace_v1") - phòng trường hợp sau này bạn đổi model AI khác
    @Column(name = "model_version")
    private String modelVersion;

    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public double[] getEmbeddingVector() {
        return embeddingVector;
    }

    public void setEmbeddingVector(double[] embeddingVector) {
        this.embeddingVector = embeddingVector;
    }

    public FileDescription getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(FileDescription imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }
}
