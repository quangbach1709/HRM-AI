package com.hrm.backend.entity;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;

@Table(name = "tbl_user")
@Entity
public class  User extends AuditableEntity implements UserDetails {
    private static final long serialVersionUID = 1L;
    @Column(name = "username", unique = true, nullable = false)
    private String username;
    @Column(name = "password", nullable = false)
    private String password;
    @Transient
    private String confirmPassword;
    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;// thời gian đang nhập gần nhất
    @Column(name = "total_login_failures")
    private Long totalLoginFailures;//tổng số lần đăng nhập thất bại
    @Column(name = "last_login_failures")
    private Long lastLoginFailures; //tổng số lần đăng nhập thất bại liên tiếp
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserRole> roles;
    @OneToOne
    private Person person;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(u -> new SimpleGrantedAuthority(u.getRole().getName())).toList();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    //Trong Spring Security, false mới là bị khóa hoặc bị vô hiệu hóa.
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !this.getVoided();
    }

    public void setUsername(String username) {
        this.username = username;
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

    public LocalDateTime getLastLoginTime() {
        return lastLoginTime;
    }

    public void setLastLoginTime(LocalDateTime lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }

    public Long getTotalLoginFailures() {
        return totalLoginFailures;
    }

    public void setTotalLoginFailures(Long totalLoginFailures) {
        this.totalLoginFailures = totalLoginFailures;
    }

    public Long getLastLoginFailures() {
        return lastLoginFailures;
    }

    public void setLastLoginFailures(Long lastLoginFailures) {
        this.lastLoginFailures = lastLoginFailures;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
    }

    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }
}
