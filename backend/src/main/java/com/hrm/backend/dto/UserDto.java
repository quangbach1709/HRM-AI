package com.hrm.backend.dto;


import com.hrm.backend.entity.User;
import com.hrm.backend.entity.UserRole;

import java.util.ArrayList;
import java.util.List;

public class UserDto extends AuditableDto {
    private String username;
    private String password;
    private String confirmPassword;
    private String email;
    private List<RoleDto> roles;
    private PersonDto person;

    public UserDto() {
    }

    public UserDto(User entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            this.username = entity.getUsername();
            this.email = entity.getEmail();

            if (isGetFull) {
                if (entity.getPerson() != null) {
                    this.person = new PersonDto(entity.getPerson(), false);
                }
                if (entity.getRoles() != null && !entity.getRoles().isEmpty()) {
                    this.roles = new ArrayList<>();
                    for (UserRole userRole : entity.getRoles()) {
                        this.roles.add(new RoleDto(userRole.getRole()));
                    }
                }
            }
        }
    }

    public UserDto(User entity) {
        this(entity, true);
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<RoleDto> getRoles() {
        return roles;
    }

    public void setRoles(List<RoleDto> roles) {
        this.roles = roles;
    }

    public PersonDto getPerson() {
        return person;
    }

    public void setPerson(PersonDto person) {
        this.person = person;
    }
}
