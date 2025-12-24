package com.hrm.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Email hoặc username không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}