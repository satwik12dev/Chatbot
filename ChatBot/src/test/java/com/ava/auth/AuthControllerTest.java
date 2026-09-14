package com.ava.auth;

import com.ava.auth.controller.AuthController;
import com.ava.auth.dto.*;
import com.ava.auth.security.CustomUserDetailsService;
import com.ava.auth.security.JwtService;
import com.ava.auth.service.AuthService;
import com.ava.common.filter.CorrelationIdFilter;
import com.ava.config.GeminiProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(GeminiProperties.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private com.ava.ratelimit.RateLimitService rateLimitService;

    @MockitoBean
    private com.ava.auth.service.OtpService otpService;

    @MockitoBean
    private CorrelationIdFilter correlationIdFilter;

    @Test
    @DisplayName("Should register new user successfully")
    void testRegister() throws Exception {
        RegisterRequest request = new RegisterRequest("Satwik", "satwik@example.com", "password123");
        UserProfileResponse user = new UserProfileResponse("u1", "Satwik", "satwik@example.com", Instant.now());
        AuthResponse authResponse = AuthResponse.of("mock-access-token", "mock-refresh-token", 900000, user);

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"))
                .andExpect(jsonPath("$.data.refreshToken").value("mock-refresh-token"))
                .andExpect(jsonPath("$.data.user.email").value("satwik@example.com"));
    }

    @Test
    @DisplayName("Should login existing user successfully")
    void testLogin() throws Exception {
        LoginRequest request = new LoginRequest("satwik@example.com", "password123");
        UserProfileResponse user = new UserProfileResponse("u1", "Satwik", "satwik@example.com", Instant.now());
        AuthResponse authResponse = AuthResponse.of("mock-access-token", "mock-refresh-token", 900000, user);

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"));
    }
}
