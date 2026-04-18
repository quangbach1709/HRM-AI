package com.hrm.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Message gửi từ Backend Java sang AI Service qua RabbitMQ
 * khi HR duyệt một bản ghi khuôn mặt.
 * AI Service sẽ cập nhật is_active = true cho bản ghi tương ứng trong DB của nó.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class FaceApprovalMessage {

    /** ID bản ghi FaceEmbedding trong DB của AI Service */
    @JsonProperty("aiEmbeddingId")
    private String aiEmbeddingId;

    /** ID bản ghi FaceEmbedding trong DB của Backend Java (để trace) */
    @JsonProperty("backendId")
    private String backendEmbeddingId;

    /** Trạng thái kích hoạt mới: true = đã duyệt */
    @JsonProperty("isActive")
    private boolean isActive;

    /** Username của HR thực hiện duyệt (để audit) */
    @JsonProperty("approvedBy")
    private String approvedBy;

    public FaceApprovalMessage() {}

    public FaceApprovalMessage(String aiEmbeddingId, String backendEmbeddingId, boolean isActive, String approvedBy) {
        this.aiEmbeddingId = aiEmbeddingId;
        this.backendEmbeddingId = backendEmbeddingId;
        this.isActive = isActive;
        this.approvedBy = approvedBy;
    }

    public String getAiEmbeddingId() { return aiEmbeddingId; }
    public void setAiEmbeddingId(String aiEmbeddingId) { this.aiEmbeddingId = aiEmbeddingId; }

    public String getBackendEmbeddingId() { return backendEmbeddingId; }
    public void setBackendEmbeddingId(String backendEmbeddingId) { this.backendEmbeddingId = backendEmbeddingId; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    @Override
    public String toString() {
        return "FaceApprovalMessage{" +
                "aiEmbeddingId='" + aiEmbeddingId + '\'' +
                ", backendEmbeddingId='" + backendEmbeddingId + '\'' +
                ", isActive=" + isActive +
                ", approvedBy='" + approvedBy + '\'' +
                '}';
    }
}
