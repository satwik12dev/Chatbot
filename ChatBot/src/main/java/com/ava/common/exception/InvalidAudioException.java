package com.ava.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidAudioException extends ApiException {
    public InvalidAudioException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "INVALID_AUDIO");
    }
}
