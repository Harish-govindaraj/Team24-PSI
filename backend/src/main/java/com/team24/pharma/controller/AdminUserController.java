package com.team24.pharma.controller;

import com.team24.pharma.domain.entity.User;
import com.team24.pharma.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<User> users = adminUserService.getAllUsers();
        
        // Map to a safe DTO-like map to prevent password hashes from leaking
        List<Map<String, Object>> safeUsers = users.stream().map(u -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName() != null ? u.getFullName() : "");
            map.put("email", u.getEmail() != null ? u.getEmail() : "");
            map.put("role", u.getRole() != null ? u.getRole().name() : "");
            map.put("verificationStatus", u.getVerificationStatus() != null ? u.getVerificationStatus().name() : "");
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", safeUsers
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User deleted successfully"
        ));
    }
}
