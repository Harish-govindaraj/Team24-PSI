package com.team24.pharma.common.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.team24.pharma.common.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<Object> handleAiServiceException(AiServiceException ex) {
        log.error("AI service error: {}", ex.getMessage(), ex);
        HttpStatus status = ex.getStatus() != null ? ex.getStatus() : HttpStatus.SERVICE_UNAVAILABLE;
        
        Map<String, Object> body = new HashMap<>();
        if (status == HttpStatus.SERVICE_UNAVAILABLE) {
            body.put("error", "AI forecasting service unavailable");
            body.put("service", "ml-service");
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("details", ex.getMessage());
        } else if (status == HttpStatus.NOT_FOUND || status == HttpStatus.BAD_REQUEST) {
            body.put("error", "Forecast unavailable");
            if (ex.getCategory() != null) {
                body.put("category", ex.getCategory());
            }
            // Assuming message contains the reason
            body.put("reason", ex.getMessage());
        } else if (status == HttpStatus.BAD_GATEWAY || status == HttpStatus.INTERNAL_SERVER_ERROR) {
            status = HttpStatus.BAD_GATEWAY;
            body.put("error", "AI prediction failed");
            body.put("reason", ex.getMessage());
        } else {
            body.put("error", "AI service error");
            body.put("reason", ex.getMessage());
        }
        
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.warn("Validation failed: {}", errors);

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied"));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        String msg = ex.getMessage().toLowerCase();
        if (msg.contains("phone_number")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Phone number already in use"));
        } else if (msg.contains("uk_users_role_reg_id") || msg.contains("business_registration_id")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Registration ID already exists"));
        } else if (msg.contains("email")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Email already exists"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Database constraint violated"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}
