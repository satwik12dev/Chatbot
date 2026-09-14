package com.ava.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatMessageRequest(
        @NotBlank(message = "Message content cannot be blank")
        @Size(max = 10000, message = "Message content cannot exceed 10000 characters")
        String message
) {}
