package com.team24.pharma.service;

import com.team24.pharma.common.enums.Role;
import com.team24.pharma.common.enums.VerificationStatus;
import com.team24.pharma.domain.entity.User;
import com.team24.pharma.domain.repository.UserRepository;
import com.team24.pharma.dto.RegistrationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.team24.pharma.dto.LoginRequest;
import com.team24.pharma.dto.LoginResponse;
import com.team24.pharma.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public User registerUser(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (StringUtils.hasText(request.getPhoneNumber()) && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use");
        }

        String reqRole = request.getRequestedRole().toUpperCase();

        if ("ADMIN".equals(reqRole) || "ROLE_ADMIN".equals(reqRole)) {
            throw new IllegalArgumentException("Invalid requested role");
        }

        VerificationStatus status;
        String businessName = null;
        String businessRegistrationId = null;

        if ("CUSTOMER".equals(reqRole) || "ROLE_CUSTOMER".equals(reqRole)) {
            status = VerificationStatus.VERIFIED;
            reqRole = "CUSTOMER"; // Normalize
        } else if ("PHARMA_SHOP_OWNER".equals(reqRole) || "PHARMA_COMPANY_OWNER".equals(reqRole)) {
            status = VerificationStatus.PENDING_VERIFICATION;
            
            if (!StringUtils.hasText(request.getBusinessName())) {
                throw new IllegalArgumentException("Business name is required for business owners");
            }
            if (!StringUtils.hasText(request.getBusinessRegistrationId())) {
                throw new IllegalArgumentException("Business registration ID is required for business owners");
            }
            if (userRepository.existsByRequestedRoleAndBusinessRegistrationId(reqRole, request.getBusinessRegistrationId())) {
                throw new IllegalArgumentException("Company Registration ID already registered");
            }
            
            businessName = request.getBusinessName();
            businessRegistrationId = request.getBusinessRegistrationId();
        } else {
            throw new IllegalArgumentException("Invalid requested role");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(Role.ROLE_CUSTOMER) // Baseline role for everyone until verified
                .requestedRole(reqRole)
                .verificationStatus(status)
                .businessName(businessName)
                .businessRegistrationId(businessRegistrationId)
                .build();

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000) // seconds
                .user(LoginResponse.UserSummary.builder()
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .verificationStatus(user.getVerificationStatus().name())
                        .build())
                .build();
    }

    public LoginResponse adminLogin(LoginRequest request) {
        LoginResponse response = login(request);
        if (!"ROLE_ADMIN".equals(response.getUser().getRole())) {
            throw new BadCredentialsException("Administrator access is required.");
        }
        return response;
    }
}
