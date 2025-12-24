package com.hrm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;


@MappedSuperclass
public class BaseObject extends AuditableEntity{
    private static final long serialVersionUID = 1L;
    @Column(name = "code", unique = true)
    private String code;
    @Column(name = "name")
    private String name;
    @Column(name = "description")
    private String description;

    public BaseObject() {
    }

    public BaseObject(BaseObject entity) {
        super(entity);
        if (entity != null) {
            this.code = entity.getCode();
            this.name = entity.getName();
            this.description = entity.getDescription();
        }
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
