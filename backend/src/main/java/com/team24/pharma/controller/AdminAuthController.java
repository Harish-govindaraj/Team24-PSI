package com.team24.pharma.controller;

import com.team24.pharma.common.response.ApiResponse;
import com.team24.pharma.dto.LoginRequest;
import com.team24.pharma.dto.LoginResponse;
import com.team24.pharma.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> adminLogin(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Admin login successful"));
    }
}
