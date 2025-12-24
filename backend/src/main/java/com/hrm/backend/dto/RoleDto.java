package com.hrm.backend.dto;


import com.hrm.backend.entity.Role;

public class RoleDto extends AuditableDto {
    private String name;
    private String description;

    public RoleDto() {
    }

    public RoleDto(Role entity) {
        super(entity);
        if (entity != null) {
            this.name = entity.getName();
            this.description = entity.getDescription();
        }
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
