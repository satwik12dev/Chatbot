package com.ava.chat;

import com.ava.auth.security.CustomUserDetailsService;
import com.ava.auth.security.JwtService;
import com.ava.auth.security.UserPrincipal;
import com.ava.chat.controller.ChatController;
import com.ava.chat.dto.ChatMessageRequest;
import com.ava.chat.dto.ChatMessageResponse;
import com.ava.chat.dto.MessageRole;
import com.ava.chat.dto.MessageType;
import com.ava.chat.service.ChatService;
import com.ava.common.filter.CorrelationIdFilter;
import com.ava.config.GeminiProperties;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ChatController.class)
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(GeminiProperties.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ChatService chatService;

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
    @DisplayName("Should send message via POST /api/v1/conversations/{id}/messages")
    void testSendMessage() throws Exception {
        ChatMessageRequest request = new ChatMessageRequest("Explain dependency injection");
        ChatMessageResponse response = new ChatMessageResponse(
                "msg-1",
                "conv-1",
                MessageRole.ASSISTANT,
                "Dependency injection is a pattern...",
                MessageType.TEXT,
                "gemini-2.5-flash",
                42,
                Instant.now()
        );

        when(chatService.sendMessage(eq("test-user-id"), eq("conv-1"), any(ChatMessageRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/conversations/conv-1/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("msg-1"))
                .andExpect(jsonPath("$.data.content").value("Dependency injection is a pattern..."));
    }
}
