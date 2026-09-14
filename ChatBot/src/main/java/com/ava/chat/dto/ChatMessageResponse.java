package com.ava.chat.dto;

import com.ava.chat.entity.Message;
import java.time.Instant;

public record ChatMessageResponse(
        String id,
        String conversationId,
        MessageRole role,
        String content,
        MessageType messageType,
        String model,
        Integer totalTokens,
        Instant createdAt
) {
    public static ChatMessageResponse from(Message m) {
        return new ChatMessageResponse(
                m.getId(),
                m.getConversation().getId(),
                m.getRole(),
                m.getContent(),
                m.getMessageType(),
                m.getModel(),
                m.getTotalTokens(),
                m.getCreatedAt()
        );
    }
}
