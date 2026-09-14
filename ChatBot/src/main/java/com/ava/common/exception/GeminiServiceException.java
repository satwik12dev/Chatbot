package com.ava.common.exception;

import org.springframework.http.HttpStatus;

public class GeminiServiceException extends ApiException {
    public GeminiServiceException(String message) {
        super(message, HttpStatus.BAD_GATEWAY, "GEMINI_SERVICE_ERROR");
    }

    public GeminiServiceException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_GATEWAY, "GEMINI_SERVICE_ERROR");
    }
}
