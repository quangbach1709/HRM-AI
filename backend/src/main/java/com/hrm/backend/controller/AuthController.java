package com.hrm.backend.controller;

import com.hrm.backend.dto.auth.AuthResponse;
import com.hrm.backend.dto.auth.LoginRequest;
import com.hrm.backend.entity.User;
import com.hrm.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" })
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;

  public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

    User user = (User) authentication.getPrincipal();

    List<String> roles = user.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .toList();

    // Pass roles as extra claims to JWT
    Map<String, Object> extraClaims = new HashMap<>();
    extraClaims.put("roles", roles);
    String jwt = jwtService.generateToken(extraClaims, user);

    return ResponseEntity.ok(new AuthResponse(
        jwt,
        user.getId().toString(),
        user.getUsername(),
        user.getEmail(),
        roles));
  }

  @GetMapping("/me")
  public ResponseEntity<AuthResponse> getCurrentUser(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    List<String> roles = user.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .toList();

    return ResponseEntity.ok(new AuthResponse(
        null,
        user.getId().toString(),
        user.getUsername(),
        user.getEmail(),
        roles));
  }
}