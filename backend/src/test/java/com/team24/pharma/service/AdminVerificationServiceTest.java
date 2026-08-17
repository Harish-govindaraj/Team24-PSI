package com.team24.pharma.service;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.common.enums.VerificationStatus;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.domain.repository.UserRepository;
import com.team24.pharma.dto.PendingVerificationResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminVerificationServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminVerificationService adminVerificationService;

    private User pendingShopOwner;
    private User pendingCompanyOwner;
    private User verifiedCustomer;
    private User rejectedOwner;

    @BeforeEach
    void setUp() {
        pendingShopOwner = User.builder()
                .id(1L)
                .fullName("Shop Owner")
                .email("shop@example.com")
                .role(Role.ROLE_CUSTOMER)
                .requestedRole("PHARMA_SHOP_OWNER")
                .verificationStatus(VerificationStatus.PENDING_VERIFICATION)
                .businessName("Shop Biz")
                .businessRegistrationId("123")
                .createdAt(LocalDateTime.now())
                .build();

        pendingCompanyOwner = User.builder()
                .id(2L)
                .fullName("Company Owner")
                .email("company@example.com")
                .role(Role.ROLE_CUSTOMER)
                .requestedRole("PHARMA_COMPANY_OWNER")
                .verificationStatus(VerificationStatus.PENDING_VERIFICATION)
                .businessName("Company Biz")
                .businessRegistrationId("456")
                .createdAt(LocalDateTime.now())
                .build();

        verifiedCustomer = User.builder()
                .id(3L)
                .role(Role.ROLE_CUSTOMER)
                .requestedRole("CUSTOMER")
                .verificationStatus(VerificationStatus.VERIFIED)
                .build();

        rejectedOwner = User.builder()
                .id(4L)
                .role(Role.ROLE_CUSTOMER)
                .requestedRole("PHARMA_SHOP_OWNER")
                .verificationStatus(VerificationStatus.REJECTED)
                .build();
    }

    @Test
    void getPendingVerifications_ReturnsPendingBusinessOwners() {
        when(userRepository.findByVerificationStatusAndRequestedRoleIn(
                eq(VerificationStatus.PENDING_VERIFICATION),
                any()
        )).thenReturn(List.of(pendingShopOwner, pendingCompanyOwner));

        List<PendingVerificationResponse> result = adminVerificationService.getPendingVerifications();

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals("PHARMA_SHOP_OWNER", result.get(0).getRequestedRole());
        assertEquals(2L, result.get(1).getId());
        assertEquals("PHARMA_COMPANY_OWNER", result.get(1).getRequestedRole());
    }

    @Test
    void approveApplication_PendingShopOwner_UpdatesRoleAndStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingShopOwner));

        adminVerificationService.approveApplication(1L);

        assertEquals(Role.ROLE_PHARMA_SHOP_OWNER, pendingShopOwner.getRole());
        assertEquals(VerificationStatus.VERIFIED, pendingShopOwner.getVerificationStatus());
        verify(userRepository).save(pendingShopOwner);
    }

    @Test
    void approveApplication_PendingCompanyOwner_UpdatesRoleAndStatus() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(pendingCompanyOwner));

        adminVerificationService.approveApplication(2L);

        assertEquals(Role.ROLE_PHARMA_COMPANY_OWNER, pendingCompanyOwner.getRole());
        assertEquals(VerificationStatus.VERIFIED, pendingCompanyOwner.getVerificationStatus());
        verify(userRepository).save(pendingCompanyOwner);
    }

    @Test
    void rejectApplication_PendingShopOwner_UpdatesStatusKeepsRole() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(pendingShopOwner));

        adminVerificationService.rejectApplication(1L);

        assertEquals(Role.ROLE_CUSTOMER, pendingShopOwner.getRole());
        assertEquals(VerificationStatus.REJECTED, pendingShopOwner.getVerificationStatus());
        verify(userRepository).save(pendingShopOwner);
    }

    @Test
    void rejectApplication_PendingCompanyOwner_UpdatesStatusKeepsRole() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(pendingCompanyOwner));

        adminVerificationService.rejectApplication(2L);

        assertEquals(Role.ROLE_CUSTOMER, pendingCompanyOwner.getRole());
        assertEquals(VerificationStatus.REJECTED, pendingCompanyOwner.getVerificationStatus());
        verify(userRepository).save(pendingCompanyOwner);
    }

    @Test
    void approveApplication_NonExistentUser_ThrowsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> adminVerificationService.approveApplication(99L));
        verify(userRepository, never()).save(any());
    }

    @Test
    void approveApplication_AlreadyVerifiedUser_ThrowsException() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(verifiedCustomer));

        assertThrows(IllegalStateException.class, () -> adminVerificationService.approveApplication(3L));
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectApplication_AlreadyRejectedUser_ThrowsException() {
        when(userRepository.findById(4L)).thenReturn(Optional.of(rejectedOwner));

        assertThrows(IllegalStateException.class, () -> adminVerificationService.rejectApplication(4L));
        verify(userRepository, never()).save(any());
    }

    @Test
    void approveApplication_NormalCustomer_ThrowsException() {
        User pendingCustomer = User.builder()
                .id(5L)
                .role(Role.ROLE_CUSTOMER)
                .requestedRole("CUSTOMER")
                .verificationStatus(VerificationStatus.PENDING_VERIFICATION)
                .build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(pendingCustomer));

        assertThrows(IllegalArgumentException.class, () -> adminVerificationService.approveApplication(5L));
        verify(userRepository, never()).save(any());
    }
}
