package com.team24.pharma.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String tokenType;
    private long expiresIn;
    private UserSummary user;

    @Data
    @Builder
    public static class UserSummary {
        private String fullName;
        private String email;
        private String role;
        private String verificationStatus;
    }
}
