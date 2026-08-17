package com.team24.pharma.controller;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.common.enums.VerificationStatus;
import com.team24.pharma.domain.repository.ProductCategoryRepository;
import com.team24.pharma.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ProductCategoryRepository productCategoryRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long pendingVerifications = userRepository.findByVerificationStatusAndRequestedRoleIn(
                VerificationStatus.PENDING_VERIFICATION,
                List.of("PHARMA_SHOP_OWNER", "PHARMA_COMPANY_OWNER")
        ).size();

        long totalUsers = userRepository.count();

        long totalBusinesses = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_PHARMA_SHOP_OWNER || u.getRole() == Role.ROLE_PHARMA_COMPANY_OWNER)
                .count();

        long activeProducts = productCategoryRepository.findAll().stream()
                .filter(p -> p.isActive())
                .count();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "pendingVerifications", pendingVerifications,
                        "totalUsers", totalUsers,
                        "totalBusinesses", totalBusinesses,
                        "activeProducts", activeProducts
                )
        ));
    }
}
