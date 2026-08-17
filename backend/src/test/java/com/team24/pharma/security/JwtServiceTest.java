package com.team24.pharma.security;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.domain.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set properties that are normally injected via @Value
        ReflectionTestUtils.setField(jwtService, "secretKey", "8f2a1b9e5d6c7438fa918b9c6d3f2a1e4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 7200000L); // 2 hours

        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setRole(Role.ROLE_CUSTOMER);
        testUser.setVerificationStatus(com.team24.pharma.common.enums.VerificationStatus.VERIFIED);
    }

    @Test
    void generateToken_ValidUser_GeneratesTokenWithRole() {
        String token = jwtService.generateToken(testUser);
        assertNotNull(token);

        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("test@example.com", extractedUsername);

        String extractedRole = jwtService.extractRole(token);
        assertEquals("ROLE_CUSTOMER", extractedRole);
        
        String extractedVerificationStatus = jwtService.extractClaim(token, claims -> claims.get("verificationStatus", String.class));
        assertEquals("VERIFIED", extractedVerificationStatus);
        
        assertTrue(jwtService.isTokenValid(token, testUser));
    }

    @Test
    void isTokenExpired_GeneratesExpiredToken_ReturnsTrue() {
        // Set expiration to a negative value to generate an immediately expired token
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        String token = jwtService.generateToken(testUser);

        assertThrows(ExpiredJwtException.class, () -> jwtService.isTokenValid(token, testUser));
    }

    @Test
    void extractUsername_TamperedToken_ThrowsException() {
        String token = jwtService.generateToken(testUser);
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertThrows(SignatureException.class, () -> jwtService.extractUsername(tamperedToken));
    }

    @Test
    void extractUsername_MalformedToken_ThrowsException() {
        assertThrows(MalformedJwtException.class, () -> jwtService.extractUsername("not.a.token"));
    }
}
