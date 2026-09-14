package com.ava.common.exception;

import org.springframework.http.HttpStatus;

public class ToolExecutionException extends ApiException {
    public ToolExecutionException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "TOOL_EXECUTION_ERROR");
    }

    public ToolExecutionException(String message, Throwable cause) {
        super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR, "TOOL_EXECUTION_ERROR");
    }
}
