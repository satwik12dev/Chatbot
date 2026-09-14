package com.ava.conversation;

import com.ava.auth.security.CustomUserDetailsService;
import com.ava.auth.security.JwtService;
import com.ava.auth.security.UserPrincipal;
import com.ava.common.filter.CorrelationIdFilter;
import com.ava.common.response.PagedResponse;
import com.ava.config.GeminiProperties;
import com.ava.conversation.controller.ConversationController;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.dto.CreateConversationRequest;
import com.ava.conversation.service.ConversationService;
import com.ava.ratelimit.RateLimitService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ConversationController.class)
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(GeminiProperties.class)
class ConversationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ConversationService conversationService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private RateLimitService rateLimitService;

    @MockitoBean
    private CorrelationIdFilter correlationIdFilter;

    @BeforeEach
    void setUpSecurity() {
        UserPrincipal principal = new UserPrincipal("test-user-id", "Satwik", "satwik@example.com", "pass", true, List.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Should create new conversation via POST /api/v1/conversations")
    void testCreateConversation() throws Exception {
        CreateConversationRequest request = new CreateConversationRequest("AI Assistant Chat");
        ConversationResponse response = new ConversationResponse(
                "conv-1", "test-user-id", "AI Assistant Chat", false, 0L, Instant.now(), Instant.now());

        when(conversationService.createConversation(eq("test-user-id"), any(CreateConversationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("conv-1"))
                .andExpect(jsonPath("$.data.title").value("AI Assistant Chat"));
    }

    @Test
    @DisplayName("Should list user conversations via GET /api/v1/conversations")
    void testListConversations() throws Exception {
        ConversationResponse c = new ConversationResponse(
                "conv-1", "test-user-id", "AI Assistant Chat", false, 0L, Instant.now(), Instant.now());
        PagedResponse<ConversationResponse> paged = new PagedResponse<>(List.of(c), 0, 20, 1, 1, true);

        when(conversationService.getConversations(eq("test-user-id"), any(), anyInt(), anyInt()))
                .thenReturn(paged);

        mockMvc.perform(get("/api/v1/conversations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value("conv-1"));
    }

    @Test
    @DisplayName("Should delete conversation via DELETE /api/v1/conversations/{id}")
    void testDeleteConversation() throws Exception {
        mockMvc.perform(delete("/api/v1/conversations/conv-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
