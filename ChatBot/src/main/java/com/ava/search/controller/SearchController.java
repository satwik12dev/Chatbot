package com.ava.search.controller;

import com.ava.common.response.ApiResponse;
import com.ava.common.util.SecurityUtils;
import com.ava.search.dto.SearchResponse;
import com.ava.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@Validated
@Tag(name = "Search", description = "Endpoints for searching conversations and messages")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/conversations")
    @Operation(summary = "Search user conversations by title and message content")
    public ResponseEntity<ApiResponse<SearchResponse>> searchConversations(
            @RequestParam @NotBlank(message = "Search query cannot be blank") String q,
            @RequestParam(defaultValue = "10") int limit) {
        String userId = SecurityUtils.getCurrentUserId();
        SearchResponse response = searchService.search(userId, q, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
