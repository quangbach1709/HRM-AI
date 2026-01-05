package com.hrm.backend.dto.search;

import java.util.UUID;

/**
 * DTO tìm kiếm cho FaceEmbedding
 */
public class SearchFaceEmbeddingDto extends SearchDto {

    private UUID personId;
    private Boolean isActive;
    private String modelVersion;

    // Sorting
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    public SearchFaceEmbeddingDto() {
    }

    public UUID getPersonId() {
        return personId;
    }

    public void setPersonId(UUID personId) {
        this.personId = personId;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }
}
