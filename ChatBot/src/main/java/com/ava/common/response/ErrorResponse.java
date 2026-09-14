package com.ava.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path,
        String correlationId,
        Map<String, String> errors
) {
    public ErrorResponse(int status, String code, String message, String path, String correlationId) {
        this(Instant.now(), status, code, message, path, correlationId, null);
    }

    public ErrorResponse(int status, String code, String message, String path, String correlationId, Map<String, String> errors) {
        this(Instant.now(), status, code, message, path, correlationId, errors);
    }
}
