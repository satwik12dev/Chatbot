package com.ava.search.dto;

import com.ava.chat.dto.ChatMessageResponse;
import com.ava.conversation.dto.ConversationResponse;
import java.util.List;

public record SearchResponse(
        String query,
        List<ConversationResponse> matchedConversations,
        List<ChatMessageResponse> matchedMessages
) {}
