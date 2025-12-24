package com.hrm.backend.dto;

import com.hrm.backend.entity.FaceEmbedding;

public class FaceEmbeddingDto extends AuditableDto{
    private PersonDto person;
    private double[] embeddingVector;
    private String imageUrl;
    private boolean isActive = true;
    private String modelVersion;

    public FaceEmbeddingDto() {
        super();
    }

    public FaceEmbeddingDto(FaceEmbedding entity) {
        super(entity);
        this.person = new PersonDto(entity.getPerson(), false);
        this.embeddingVector = entity.getEmbeddingVector();
        this.imageUrl = entity.getImageUrl();
        this.isActive = entity.isActive();
        this.modelVersion = entity.getModelVersion();
    }

    public PersonDto getPerson() {
        
        return person;
    }

    public void setPerson(PersonDto person) {
        this.person = person;
    }

    public double[] getEmbeddingVector() {
        return embeddingVector;
    }

    public void setEmbeddingVector(double[] embeddingVector) {
        this.embeddingVector = embeddingVector;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
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
