package com.team24.pharma.service;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.common.enums.VerificationStatus;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.domain.repository.UserRepository;
import com.team24.pharma.dto.PendingVerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminVerificationService {

    private final UserRepository userRepository;

    public List<PendingVerificationResponse> getPendingVerifications() {
        List<User> pendingUsers = userRepository.findByVerificationStatusAndRequestedRoleIn(
                VerificationStatus.PENDING_VERIFICATION,
                List.of("PHARMA_SHOP_OWNER", "PHARMA_COMPANY_OWNER")
        );

        return pendingUsers.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveApplication(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getVerificationStatus() != VerificationStatus.PENDING_VERIFICATION) {
            throw new IllegalStateException("User application is not pending verification");
        }

        if ("PHARMA_SHOP_OWNER".equals(user.getRequestedRole())) {
            user.setRole(Role.ROLE_PHARMA_SHOP_OWNER);
        } else if ("PHARMA_COMPANY_OWNER".equals(user.getRequestedRole())) {
            user.setRole(Role.ROLE_PHARMA_COMPANY_OWNER);
        } else {
            throw new IllegalArgumentException("Unsupported requested role for verification");
        }

        user.setVerificationStatus(VerificationStatus.VERIFIED);
        userRepository.save(user);
    }

    @Transactional
    public void rejectApplication(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getVerificationStatus() != VerificationStatus.PENDING_VERIFICATION) {
            throw new IllegalStateException("User application is not pending verification");
        }

        if (!"PHARMA_SHOP_OWNER".equals(user.getRequestedRole()) && !"PHARMA_COMPANY_OWNER".equals(user.getRequestedRole())) {
            throw new IllegalArgumentException("Unsupported requested role for verification");
        }

        // Keep role as ROLE_CUSTOMER
        user.setVerificationStatus(VerificationStatus.REJECTED);
        userRepository.save(user);
    }

    private PendingVerificationResponse mapToDto(User user) {
        return PendingVerificationResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .businessName(user.getBusinessName())
                .businessRegistrationId(user.getBusinessRegistrationId())
                .requestedRole(user.getRequestedRole())
                .verificationStatus(user.getVerificationStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
