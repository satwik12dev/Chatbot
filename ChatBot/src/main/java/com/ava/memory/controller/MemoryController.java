package com.ava.memory.controller;

import com.ava.common.response.ApiResponse;
import com.ava.common.util.SecurityUtils;
import com.ava.memory.dto.MemoryResponse;
import com.ava.memory.service.UserMemoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/memories")
@Tag(name = "Memories", description = "Endpoints for managing persistent long-term user memories")
public class MemoryController {

    private final UserMemoryService userMemoryService;

    public MemoryController(UserMemoryService userMemoryService) {
        this.userMemoryService = userMemoryService;
    }

    @GetMapping
    @Operation(summary = "Get all long-term memories stored for current user")
    public ResponseEntity<ApiResponse<List<MemoryResponse>>> getMemories() {
        String userId = SecurityUtils.getCurrentUserId();
        List<MemoryResponse> memories = userMemoryService.getUserMemories(userId);
        return ResponseEntity.ok(ApiResponse.success(memories));
    }

    @DeleteMapping("/{memoryId}")
    @Operation(summary = "Delete a specific memory by ID")
    public ResponseEntity<ApiResponse<Void>> deleteMemory(@PathVariable String memoryId) {
        String userId = SecurityUtils.getCurrentUserId();
        userMemoryService.deleteMemory(userId, memoryId);
        return ResponseEntity.ok(ApiResponse.ok("Memory deleted successfully"));
    }

    @DeleteMapping
    @Operation(summary = "Delete all stored memories for current user")
    public ResponseEntity<ApiResponse<Void>> deleteAllMemories() {
        String userId = SecurityUtils.getCurrentUserId();
        userMemoryService.deleteAllMemories(userId);
        return ResponseEntity.ok(ApiResponse.ok("All user memories cleared"));
    }
}
