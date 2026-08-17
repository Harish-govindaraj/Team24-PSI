package com.team24.pharma.service;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.common.enums.VerificationStatus;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.domain.repository.UserRepository;
import com.team24.pharma.dto.RegistrationRequest;
import com.team24.pharma.dto.LoginRequest;
import com.team24.pharma.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private RegistrationRequest baseRequest;

    @BeforeEach
    void setUp() {
        baseRequest = new RegistrationRequest();
        baseRequest.setFullName("John Doe");
        baseRequest.setEmail("john@example.com");
        baseRequest.setPassword("password123");
        baseRequest.setPhoneNumber("555-1234");
    }

    @Test
    void registerUser_Customer_Success() {
        baseRequest.setRequestedRole("CUSTOMER");
        baseRequest.setBusinessName("Some Business"); // Should be ignored
        baseRequest.setBusinessRegistrationId("B123"); // Should be ignored

        when(userRepository.existsByEmail(baseRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(baseRequest.getPassword())).thenReturn("hashed_pwd");
        
        User savedUser = new User();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        authService.registerUser(baseRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User captured = userCaptor.getValue();
        assertEquals(Role.ROLE_CUSTOMER, captured.getRole());
        assertEquals("CUSTOMER", captured.getRequestedRole());
        assertEquals(VerificationStatus.VERIFIED, captured.getVerificationStatus());
        assertNull(captured.getBusinessName());
        assertNull(captured.getBusinessRegistrationId());
        assertEquals("hashed_pwd", captured.getPasswordHash());
    }

    @Test
    void registerUser_ShopOwner_Success() {
        baseRequest.setRequestedRole("PHARMA_SHOP_OWNER");
        baseRequest.setBusinessName("My Shop");
        baseRequest.setBusinessRegistrationId("S123");

        when(userRepository.existsByEmail(baseRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pwd");
        when(userRepository.save(any(User.class))).thenReturn(new User());

        authService.registerUser(baseRequest);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User captured = userCaptor.getValue();
        assertEquals(Role.ROLE_CUSTOMER, captured.getRole());
        assertEquals("PHARMA_SHOP_OWNER", captured.getRequestedRole());
        assertEquals(VerificationStatus.PENDING_VERIFICATION, captured.getVerificationStatus());
        assertEquals("My Shop", captured.getBusinessName());
        assertEquals("S123", captured.getBusinessRegistrationId());
    }

    @Test
    void registerUser_Admin_Rejected() {
        baseRequest.setRequestedRole("ADMIN");

        when(userRepository.existsByEmail(baseRequest.getEmail())).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(baseRequest);
        });
        assertEquals("Invalid requested role", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerUser_DuplicateEmail_Rejected() {
        baseRequest.setRequestedRole("CUSTOMER");
        when(userRepository.existsByEmail(baseRequest.getEmail())).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(baseRequest);
        });
        assertEquals("Email already exists", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerUser_ShopOwner_MissingBusinessName_Rejected() {
        baseRequest.setRequestedRole("PHARMA_SHOP_OWNER");
        baseRequest.setBusinessRegistrationId("S123");
        // Missing businessName

        when(userRepository.existsByEmail(baseRequest.getEmail())).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.registerUser(baseRequest);
        });
        assertEquals("Business name is required for business owners", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    // --- Login Tests ---

    @Test
    void login_Customer_Success() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("john@example.com");
        loginReq.setPassword("password123");

        User user = new User();
        user.setEmail("john@example.com");
        user.setPasswordHash("hashed_pwd");
        user.setRole(Role.ROLE_CUSTOMER);
        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setFullName("John Doe");

        when(userRepository.findByEmail("john@example.com")).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_pwd")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mock_token");
        when(jwtService.getExpirationTime()).thenReturn(7200000L);

        com.team24.pharma.dto.LoginResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertEquals("mock_token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(7200L, response.getExpiresIn());
        assertEquals("john@example.com", response.getUser().getEmail());
        assertEquals("ROLE_CUSTOMER", response.getUser().getRole());
        assertEquals("VERIFIED", response.getUser().getVerificationStatus());
    }

    @Test
    void login_PendingShopOwner_Success() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("shop@example.com");
        loginReq.setPassword("password123");

        User user = new User();
        user.setEmail("shop@example.com");
        user.setPasswordHash("hashed_pwd");
        user.setRole(Role.ROLE_CUSTOMER); // MUST be ROLE_CUSTOMER
        user.setRequestedRole("PHARMA_SHOP_OWNER");
        user.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        user.setFullName("Shop Owner");

        when(userRepository.findByEmail("shop@example.com")).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed_pwd")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mock_token");

        com.team24.pharma.dto.LoginResponse response = authService.login(loginReq);

        assertNotNull(response);
        assertEquals("ROLE_CUSTOMER", response.getUser().getRole());
        assertEquals("PENDING_VERIFICATION", response.getUser().getVerificationStatus());
        verify(jwtService).generateToken(user);
    }

    @Test
    void login_InvalidPassword_ThrowsBadCredentials() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("john@example.com");
        loginReq.setPassword("wrong_password");

        User user = new User();
        user.setPasswordHash("hashed_pwd");

        when(userRepository.findByEmail("john@example.com")).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("wrong_password", "hashed_pwd")).thenReturn(false);

        org.springframework.security.authentication.BadCredentialsException ex = assertThrows(
                org.springframework.security.authentication.BadCredentialsException.class,
                () -> authService.login(loginReq)
        );
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void login_UnknownEmail_ThrowsBadCredentials() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("unknown@example.com");
        loginReq.setPassword("password123");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(java.util.Optional.empty());

        org.springframework.security.authentication.BadCredentialsException ex = assertThrows(
                org.springframework.security.authentication.BadCredentialsException.class,
                () -> authService.login(loginReq)
        );
        assertEquals("Invalid email or password", ex.getMessage());
    }
}
