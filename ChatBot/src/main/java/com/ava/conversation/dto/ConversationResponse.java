package com.ava.conversation.dto;

import com.ava.conversation.entity.Conversation;
import java.time.Instant;

public record ConversationResponse(
        String id,
        String userId,
        String title,
        boolean archived,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {
    public static ConversationResponse from(Conversation c) {
        return new ConversationResponse(
                c.getId(),
                c.getUser().getId(),
                c.getTitle(),
                c.isArchived(),
                c.getVersion(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
