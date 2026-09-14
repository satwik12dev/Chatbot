package com.ava.conversation.controller;

import com.ava.common.response.ApiResponse;
import com.ava.common.response.PagedResponse;
import com.ava.common.util.SecurityUtils;
import com.ava.conversation.dto.CreateConversationRequest;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.dto.UpdateConversationRequest;
import com.ava.conversation.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
@Tag(name = "Conversations", description = "Endpoints for managing conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    @Operation(summary = "Create a new conversation session")
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(
            @Valid @RequestBody(required = false) CreateConversationRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        ConversationResponse response = conversationService.createConversation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Conversation created", response));
    }

    @GetMapping
    @Operation(summary = "List user conversations with pagination and archived filter")
    public ResponseEntity<ApiResponse<PagedResponse<ConversationResponse>>> getConversations(
            @RequestParam(required = false) Boolean archived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = SecurityUtils.getCurrentUserId();
        PagedResponse<ConversationResponse> response = conversationService.getConversations(userId, archived, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Get conversation details by ID")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @PathVariable String conversationId) {
        String userId = SecurityUtils.getCurrentUserId();
        ConversationResponse response = conversationService.getConversation(userId, conversationId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{conversationId}")
    @Operation(summary = "Update conversation title or archived status")
    public ResponseEntity<ApiResponse<ConversationResponse>> updateConversation(
            @PathVariable String conversationId,
            @Valid @RequestBody UpdateConversationRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        ConversationResponse response = conversationService.updateConversation(userId, conversationId, request);
        return ResponseEntity.ok(ApiResponse.success("Conversation updated", response));
    }

    @DeleteMapping("/{conversationId}")
    @Operation(summary = "Delete conversation and all its messages")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(
            @PathVariable String conversationId) {
        String userId = SecurityUtils.getCurrentUserId();
        conversationService.deleteConversation(userId, conversationId);
        return ResponseEntity.ok(ApiResponse.ok("Conversation deleted successfully"));
    }
}
