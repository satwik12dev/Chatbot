package com.ava.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StreamChunkEvent(
        String type, // "content", "complete", "error"
        String text,
        String messageId,
        String error
) {
    public static StreamChunkEvent content(String text) {
        return new StreamChunkEvent("content", text, null, null);
    }

    public static StreamChunkEvent complete(String messageId) {
        return new StreamChunkEvent("complete", null, messageId, null);
    }

    public static StreamChunkEvent error(String error) {
        return new StreamChunkEvent("error", null, null, error);
    }
}
