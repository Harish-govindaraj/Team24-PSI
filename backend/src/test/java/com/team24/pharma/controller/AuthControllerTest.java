package com.team24.pharma.controller;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.common.enums.VerificationStatus;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.dto.RegistrationRequest;
import com.team24.pharma.dto.LoginRequest;
import com.team24.pharma.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.context.annotation.Import;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import({com.team24.pharma.config.SecurityConfig.class, com.team24.pharma.security.JwtAuthenticationFilter.class, com.team24.pharma.security.JwtAuthenticationEntryPoint.class, com.team24.pharma.security.CustomAccessDeniedHandler.class})
public class AuthControllerTest {

    @org.springframework.test.context.bean.override.mockito.MockitoBean private com.team24.pharma.security.JwtService jwtService;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;


    @Test
    void register_Success() throws Exception {
        User savedUser = new User();
        savedUser.setEmail("jane@example.com");
        savedUser.setRequestedRole("CUSTOMER");
        savedUser.setVerificationStatus(VerificationStatus.VERIFIED);
        savedUser.setRole(Role.ROLE_CUSTOMER);

        when(authService.registerUser(any(RegistrationRequest.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "fullName": "Jane Doe",
                            "email": "jane@example.com",
                            "password": "password123",
                            "requestedRole": "CUSTOMER"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("jane@example.com"))
                .andExpect(jsonPath("$.data.requestedRole").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
    }

    @Test
    void register_ValidationFailure() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "email": "jane@example.com"
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.fullName").exists())
                .andExpect(jsonPath("$.data.password").exists())
                .andExpect(jsonPath("$.data.requestedRole").exists());
    }

    @Test
    void register_IllegalArgumentException_MapsTo400() throws Exception {
        when(authService.registerUser(any(RegistrationRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid requested role"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "fullName": "Jane Doe",
                            "email": "jane@example.com",
                            "password": "password123",
                            "requestedRole": "ADMIN"
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid requested role"));
    }

    // --- Login Tests ---

    @Test
    void login_Success() throws Exception {
        com.team24.pharma.dto.LoginResponse response = com.team24.pharma.dto.LoginResponse.builder()
                .token("jwt.token.here")
                .tokenType("Bearer")
                .expiresIn(7200L)
                .user(com.team24.pharma.dto.LoginResponse.UserSummary.builder()
                        .email("jane@example.com")
                        .role("ROLE_CUSTOMER")
                        .verificationStatus("VERIFIED")
                        .build())
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "email": "jane@example.com",
                            "password": "password123"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.data.user.email").value("jane@example.com"));
    }

    @Test
    void login_ValidationFailure() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "email": "invalid-email"
                        }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.email").exists())
                .andExpect(jsonPath("$.data.password").exists());
    }
}



