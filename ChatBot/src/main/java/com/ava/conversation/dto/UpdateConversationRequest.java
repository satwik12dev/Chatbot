package com.ava.conversation.dto;

import jakarta.validation.constraints.Size;

public record UpdateConversationRequest(
        @Size(max = 255, message = "Title cannot exceed 255 characters")
        String title,

        Boolean archived
) {}
