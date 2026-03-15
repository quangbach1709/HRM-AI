package com.hrm.backend.dto;

import com.hrm.backend.entity.FaceEmbedding;

public class FaceEmbeddingDto extends AuditableDto {
    private PersonDto person;
    private FileDescriptionDto imageUrl;
    private boolean isActive = false;
    private String modelVersion;
    /** Góc chụp: front / left / right */
    private String angle;
    /** ID tham chiếu bản ghi embedding vector bên AI Service */
    private String aiEmbeddingId;
    /**
     * Embedding vector dùng tạm thời trong bộ nhớ cho luồng chấm công.
     * Không lưu vào DB backend — AI Service giữ vector gốc.
     */
    private transient double[] embeddingVector;

    public FaceEmbeddingDto() {
        super();
    }

    public FaceEmbeddingDto(FaceEmbedding entity) {
        super(entity);
        this.person = entity.getPerson() != null ? new PersonDto(entity.getPerson(), false) : null;
        this.imageUrl = entity.getImageUrl() != null ? new FileDescriptionDto(entity.getImageUrl()) : null;
        this.isActive = entity.isActive();
        this.modelVersion = entity.getModelVersion();
        this.angle = entity.getAngle();
        this.aiEmbeddingId = entity.getAiEmbeddingId();
    }

    public PersonDto getPerson() {
        return person;
    }

    public void setPerson(PersonDto person) {
        this.person = person;
    }

    public FileDescriptionDto getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(FileDescriptionDto imageUrl) {
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

    public String getAngle() {
        return angle;
    }

    public void setAngle(String angle) {
        this.angle = angle;
    }

    public String getAiEmbeddingId() {
        return aiEmbeddingId;
    }

    public void setAiEmbeddingId(String aiEmbeddingId) {
        this.aiEmbeddingId = aiEmbeddingId;
    }

    public double[] getEmbeddingVector() {
        return embeddingVector;
    }

    public void setEmbeddingVector(double[] embeddingVector) {
        this.embeddingVector = embeddingVector;
    }
}
