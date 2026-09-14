package com.ava.auth.service;

import com.ava.auth.dto.*;
import com.ava.auth.entity.RefreshToken;
import com.ava.auth.repository.RefreshTokenRepository;
import com.ava.auth.security.JwtService;
import com.ava.auth.security.UserPrincipal;
import com.ava.common.exception.ApiException;
import com.ava.common.exception.ResourceNotFoundException;
import com.ava.common.exception.UnauthorizedException;
import com.ava.config.GeminiProperties;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final GeminiProperties geminiProperties;
    private final OtpService otpService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       GeminiProperties geminiProperties,
                       OtpService otpService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.geminiProperties = geminiProperties;
        this.otpService = otpService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException("Email is already registered", HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");
        }

        // Validate OTP if provided or required
        if (request.otp() != null && !request.otp().isBlank()) {
            otpService.validateOtpForRegistration(request.email(), request.otp());
        }

        User user = new User(
                request.name().trim(),
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password())
        );
        user = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(user);
        String accessToken = jwtService.generateAccessToken(principal);
        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.of(
                accessToken,
                refreshToken.getToken(),
                geminiProperties.jwt().accessTokenExpirationMs(),
                UserProfileResponse.from(user)
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().toLowerCase().trim(),
                        request.password()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        String accessToken = jwtService.generateAccessToken(principal);
        RefreshToken refreshToken = createRefreshToken(user);

        return AuthResponse.of(
                accessToken,
                refreshToken.getToken(),
                geminiProperties.jwt().accessTokenExpirationMs(),
                UserProfileResponse.from(user)
        );
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();
        // Rotate refresh token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        UserPrincipal principal = UserPrincipal.create(user);
        String newAccessToken = jwtService.generateAccessToken(principal);
        RefreshToken newRefreshToken = createRefreshToken(user);

        return AuthResponse.of(
                newAccessToken,
                newRefreshToken.getToken(),
                geminiProperties.jwt().accessTokenExpirationMs(),
                UserProfileResponse.from(user)
        );
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void deleteUserData(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        userRepository.delete(user);
    }

    private RefreshToken createRefreshToken(User user) {
        Instant expiryDate = Instant.now().plusMillis(geminiProperties.jwt().refreshTokenExpirationMs());
        String tokenString = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        RefreshToken refreshToken = new RefreshToken(user, tokenString, expiryDate);
        return refreshTokenRepository.save(refreshToken);
    }
}
