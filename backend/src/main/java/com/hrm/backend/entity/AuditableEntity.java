package com.hrm.backend.entity;



import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditableEntity implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @JdbcTypeCode(12)
    @Column(
            name = "id",
            unique = true,
            nullable = false,
            length = 36
    )
    private UUID id;

    @Column(name = "voided", nullable = false)
    private Boolean voided = Boolean.FALSE;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by")
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    public AuditableEntity() {
        this.id = UUID.randomUUID();
    }

    public AuditableEntity(AuditableEntity entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();
            this.createdBy = entity.getCreatedBy();
            this.updatedBy = entity.getUpdatedBy();
            this.voided = entity.getVoided();
        } else {
            this.id = UUID.randomUUID();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Boolean getVoided() {
        return voided;
    }

    public void setVoided(Boolean voided) {
        this.voided = voided;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
