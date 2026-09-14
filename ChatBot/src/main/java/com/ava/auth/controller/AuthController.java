package com.ava.auth.controller;

import com.ava.auth.dto.*;
import com.ava.auth.service.AuthService;
import com.ava.common.response.ApiResponse;
import com.ava.common.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, token refresh and profile")
public class AuthController {

    private final AuthService authService;
    private final com.ava.auth.service.OtpService otpService;

    public AuthController(AuthService authService, com.ava.auth.service.OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/auth/send-otp")
    @Operation(summary = "Send 6-digit email verification code for registration")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        otpService.sendOtp(request.email());
        return ResponseEntity.ok(ApiResponse.ok("Verification code sent to " + request.email()));
    }

    @PostMapping("/auth/verify-otp")
    @Operation(summary = "Verify 6-digit email verification code")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        otpService.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully"));
    }

    @PostMapping("/auth/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/auth/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/auth/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/auth/logout")
    @Operation(summary = "Log out user by invalidating refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }

    @GetMapping("/auth/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMe() {
        String userId = SecurityUtils.getCurrentUserId();
        UserProfileResponse profile = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @DeleteMapping("/users/me/data")
    @Operation(summary = "Permanently delete all user data, conversations, and account")
    public ResponseEntity<ApiResponse<Void>> deleteUserData() {
        String userId = SecurityUtils.getCurrentUserId();
        authService.deleteUserData(userId);
        return ResponseEntity.ok(ApiResponse.ok("User account and all associated data deleted successfully"));
    }
}
