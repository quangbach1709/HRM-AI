package com.hrm.backend.dto;


import com.hrm.backend.entity.Role;
import com.hrm.backend.entity.UserRole;

public class UserRoleDto extends AuditableDto {
    private RoleDto role;

    public UserRoleDto() {
    }

    public UserRoleDto(UserRole entity) {
        super(entity);
        if (entity != null) {
            this.role = new RoleDto(entity.getRole());
        }
    }

    public UserRoleDto(Role entity) {
        super(entity);
        if (entity != null) {
            this.role = new RoleDto(entity);
        }
    }

    public RoleDto getRole() {
        return role;
    }

    public void setRole(RoleDto role) {
        this.role = role;
    }
}
