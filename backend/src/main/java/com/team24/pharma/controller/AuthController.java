package com.team24.pharma.controller;

import com.team24.pharma.common.response.ApiResponse;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.dto.RegistrationRequest;
import com.team24.pharma.dto.LoginRequest;
import com.team24.pharma.dto.LoginResponse;
import com.team24.pharma.service.AuthService;
import jakarta.validation.Valid;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegistrationResponseData>> register(@Valid @RequestBody RegistrationRequest request) {
        User user = authService.registerUser(request);
        
        RegistrationResponseData data = RegistrationResponseData.builder()
                .email(user.getEmail())
                .requestedRole(user.getRequestedRole())
                .verificationStatus(user.getVerificationStatus().name())
                .build();
                
        return ResponseEntity.ok(ApiResponse.success(data, "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @Data
    @Builder
    public static class RegistrationResponseData {
        private String email;
        private String requestedRole;
        private String verificationStatus;
    }
}
