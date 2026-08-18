package com.team24.pharma.common.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public class AiServiceException extends RuntimeException {

    private final HttpStatus status;
    private final String category;

    public AiServiceException(String message) {
        super(message);
        this.status = null;
        this.category = null;
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
        this.status = null;
        this.category = null;
    }

    public AiServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
        this.category = null;
    }

    public AiServiceException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
        this.category = null;
    }
    
    public AiServiceException(String message, Throwable cause, HttpStatus status, String category) {
        super(message, cause);
        this.status = status;
        this.category = category;
    }
}
