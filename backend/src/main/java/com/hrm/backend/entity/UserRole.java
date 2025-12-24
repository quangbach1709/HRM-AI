package com.hrm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tbl_role_user", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "role_id"})  // Đảm bảo cặp user_id và role_id là duy nhất trong bảng
})
public class UserRole extends AuditableEntity {
    private static final long serialVersionUID = 1L;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    public UserRole() {
    }

    public UserRole(Role role) {
        this.role = role;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
