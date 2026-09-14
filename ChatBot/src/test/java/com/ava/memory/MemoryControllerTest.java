package com.ava.memory;

import com.ava.auth.security.CustomUserDetailsService;
import com.ava.auth.security.JwtService;
import com.ava.auth.security.UserPrincipal;
import com.ava.common.filter.CorrelationIdFilter;
import com.ava.config.GeminiProperties;
import com.ava.memory.controller.MemoryController;
import com.ava.memory.dto.MemoryResponse;
import com.ava.memory.dto.MemoryType;
import com.ava.memory.service.UserMemoryService;
import com.ava.ratelimit.RateLimitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MemoryController.class)
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(GeminiProperties.class)
class MemoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserMemoryService userMemoryService;

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
    @DisplayName("Should list memories via GET /api/v1/memories")
    void testListMemories() throws Exception {
        MemoryResponse m1 = new MemoryResponse("m1", "preferred_language", "Java", MemoryType.PREFERENCE, 5, Instant.now(), Instant.now());
        when(userMemoryService.getUserMemories("test-user-id")).thenReturn(List.of(m1));

        mockMvc.perform(get("/api/v1/memories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].memoryKey").value("preferred_language"))
                .andExpect(jsonPath("$.data[0].memoryValue").value("Java"));
    }

    @Test
    @DisplayName("Should delete individual memory via DELETE /api/v1/memories/{id}")
    void testDeleteMemory() throws Exception {
        mockMvc.perform(delete("/api/v1/memories/m1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
