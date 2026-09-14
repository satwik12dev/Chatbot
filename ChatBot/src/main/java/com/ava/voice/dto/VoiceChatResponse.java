package com.ava.voice.dto;

import com.ava.chat.dto.ChatMessageResponse;

public record VoiceChatResponse(
        String conversationId,
        String transcribedUserText,
        ChatMessageResponse assistantMessage,
        String audioUrl,
        String audioFormat
) {}
