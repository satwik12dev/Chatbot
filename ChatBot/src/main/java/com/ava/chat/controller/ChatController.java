package com.ava.chat.controller;

import com.ava.chat.dto.ChatMessageRequest;
import com.ava.chat.dto.ChatMessageResponse;
import com.ava.chat.service.ChatService;
import com.ava.common.response.ApiResponse;
import com.ava.common.response.PagedResponse;
import com.ava.common.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1/conversations/{conversationId}/messages")
@Tag(name = "Chat", description = "Endpoints for sending messages, SSE streaming and message history")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    @Operation(summary = "Send a text message and receive Gemini's assistant response")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody ChatMessageRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        ChatMessageResponse response = chatService.sendMessage(userId, conversationId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream Gemini's assistant response via Server-Sent Events (SSE)")
    public SseEmitter streamMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody ChatMessageRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        return chatService.streamMessage(userId, conversationId, request);
    }

    @GetMapping
    @Operation(summary = "Get paginated message history for a conversation")
    public ResponseEntity<ApiResponse<PagedResponse<ChatMessageResponse>>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        String userId = SecurityUtils.getCurrentUserId();
        PagedResponse<ChatMessageResponse> messages = chatService.getMessages(userId, conversationId, page, size);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
