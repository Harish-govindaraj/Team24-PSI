package com.team24.pharma.controller;

import com.team24.pharma.dto.PendingVerificationResponse;
import com.team24.pharma.service.AdminVerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/verifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final AdminVerificationService adminVerificationService;

    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingVerifications() {
        List<PendingVerificationResponse> pending = adminVerificationService.getPendingVerifications();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", pending
        ));
    }

    @PostMapping("/{userId}/approve")
    public ResponseEntity<Map<String, Object>> approveApplication(@PathVariable Long userId) {
        adminVerificationService.approveApplication(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application approved successfully"
        ));
    }

    @PostMapping("/{userId}/reject")
    public ResponseEntity<Map<String, Object>> rejectApplication(@PathVariable Long userId) {
        adminVerificationService.rejectApplication(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Application rejected successfully"
        ));
    }
}
