package com.ava.auth.service;

import com.ava.auth.entity.EmailVerification;
import com.ava.auth.repository.EmailVerificationRepository;
import com.ava.common.exception.ApiException;
import com.ava.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class OtpService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(EmailVerificationRepository emailVerificationRepository,
                      UserRepository userRepository,
                      EmailService emailService) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void sendOtp(String rawEmail) {
        String email = rawEmail.toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ApiException("Email is already registered", HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");
        }

        // Generate cryptographically secure 6-digit numeric OTP
        int number = secureRandom.nextInt(1000000);
        String otpCode = String.format("%06d", number);

        Instant expiresAt = Instant.now().plus(Duration.ofMinutes(5));

        // Delete any existing codes for this email
        emailVerificationRepository.deleteByEmail(email);

        EmailVerification verification = new EmailVerification(email, otpCode, expiresAt);
        emailVerificationRepository.save(verification);

        // Dispatch email
        emailService.sendOtpEmail(email, otpCode);
    }

    @Transactional
    public boolean verifyOtp(String rawEmail, String otpCode) {
        String email = rawEmail.toLowerCase().trim();

        EmailVerification verification = emailVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ApiException("Verification code not found. Please request a new one.", HttpStatus.BAD_REQUEST, "OTP_NOT_FOUND"));

        if (verification.isExpired()) {
            throw new ApiException("Verification code has expired. Please request a new one.", HttpStatus.BAD_REQUEST, "OTP_EXPIRED");
        }

        if (!verification.getOtpCode().equals(otpCode.trim())) {
            throw new ApiException("Invalid verification code. Please check and try again.", HttpStatus.BAD_REQUEST, "INVALID_OTP");
        }

        verification.setVerified(true);
        emailVerificationRepository.save(verification);
        return true;
    }

    @Transactional(readOnly = true)
    public void validateOtpForRegistration(String rawEmail, String otpCode) {
        if (otpCode == null || otpCode.trim().length() != 6) {
            throw new ApiException("6-digit verification code is required", HttpStatus.BAD_REQUEST, "OTP_REQUIRED");
        }

        String email = rawEmail.toLowerCase().trim();
        EmailVerification verification = emailVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ApiException("Please request an email verification code first.", HttpStatus.BAD_REQUEST, "OTP_NOT_FOUND"));

        if (verification.isExpired()) {
            throw new ApiException("Verification code has expired. Please request a new one.", HttpStatus.BAD_REQUEST, "OTP_EXPIRED");
        }

        if (!verification.getOtpCode().equals(otpCode.trim())) {
            throw new ApiException("Invalid verification code.", HttpStatus.BAD_REQUEST, "INVALID_OTP");
        }
    }
}
