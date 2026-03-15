package com.hrm.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tbl_face_embedding")
@Data
public class FaceEmbedding extends AuditableEntity{
    // Liên kết với nhân viên (1 nhân viên có nhiều mẫu khuôn mặt)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    // Đường dẫn ảnh gốc lúc đăng ký (để HR xét duyệt trực quan)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_url_id")
    private FileDescription imageUrl;

    // Trạng thái (false = chờ HR duyệt, true = đã duyệt và đang sử dụng)
    @Column(name = "is_active")
    private boolean isActive = false;

    // Model version (Ví dụ: "ArcFace_v1")
    @Column(name = "model_version")
    private String modelVersion;

    // Góc chụp: front / left / right
    @Column(name = "angle")
    private String angle;

    // ID của FaceEmbedding bên AI Service (để tra cứu vector khi cần)
    @Column(name = "ai_embedding_id")
    private String aiEmbeddingId;

}
