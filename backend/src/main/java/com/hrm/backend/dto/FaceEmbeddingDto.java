package com.hrm.backend.dto;

import com.hrm.backend.entity.FaceEmbedding;

public class FaceEmbeddingDto extends AuditableDto {
    private PersonDto person;
    private double[] embeddingVector;
    private FileDescriptionDto imageUrl;
    private boolean isActive = true;
    private String modelVersion;

    public FaceEmbeddingDto() {
        super();
    }

    public FaceEmbeddingDto(FaceEmbedding entity) {
        super(entity);
        this.person = new PersonDto(entity.getPerson(), false);
        this.imageUrl = new FileDescriptionDto(entity.getImageUrl());
        this.isActive = entity.isActive();
        this.modelVersion = entity.getModelVersion();
    }

    public FaceEmbeddingDto(FaceEmbedding entity, Boolean loadAll) {
        super(entity);
        this.person = new PersonDto(entity.getPerson(), loadAll);
        this.imageUrl = new FileDescriptionDto(entity.getImageUrl());
        this.isActive = entity.isActive();
        this.modelVersion = entity.getModelVersion();
        this.embeddingVector = entity.getEmbeddingVector();
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
}
