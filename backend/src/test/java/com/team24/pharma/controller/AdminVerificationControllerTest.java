package com.team24.pharma.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team24.pharma.common.enums.Role;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.security.JwtService;
import com.team24.pharma.service.AdminVerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminVerificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private AdminVerificationService adminVerificationService;

    private String customerToken;
    private String shopOwnerToken;
    private String companyOwnerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        User customer = new User();
        customer.setEmail("customer@example.com");
        customer.setRole(Role.ROLE_CUSTOMER);
        customer.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        customerToken = jwtService.generateToken(customer);

        User shopOwner = new User();
        shopOwner.setEmail("shop@example.com");
        shopOwner.setRole(Role.ROLE_PHARMA_SHOP_OWNER);
        shopOwner.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        shopOwnerToken = jwtService.generateToken(shopOwner);

        User companyOwner = new User();
        companyOwner.setEmail("company@example.com");
        companyOwner.setRole(Role.ROLE_PHARMA_COMPANY_OWNER);
        companyOwner.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        companyOwnerToken = jwtService.generateToken(companyOwner);

        User admin = new User();
        admin.setEmail("admin@example.com");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
        adminToken = jwtService.generateToken(admin);
    }

    @Test
    void customer_CannotAccessPending_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/verifications/pending")
                .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void shopOwner_CannotAccessPending_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/verifications/pending")
                .header("Authorization", "Bearer " + shopOwnerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void companyOwner_CannotAccessPending_Returns403() throws Exception {
        mockMvc.perform(get("/api/admin/verifications/pending")
                .header("Authorization", "Bearer " + companyOwnerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_CanAccessPending_Returns200() throws Exception {
        mockMvc.perform(get("/api/admin/verifications/pending")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void admin_CanApprove_Returns200() throws Exception {
        mockMvc.perform(post("/api/admin/verifications/1/approve")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Application approved successfully"));
    }

    @Test
    void admin_CanReject_Returns200() throws Exception {
        mockMvc.perform(post("/api/admin/verifications/1/reject")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Application rejected successfully"));
    }

    @Test
    void missingJwt_Returns401() throws Exception {
        mockMvc.perform(get("/api/admin/verifications/pending"))
                .andExpect(status().isUnauthorized());
    }
}
