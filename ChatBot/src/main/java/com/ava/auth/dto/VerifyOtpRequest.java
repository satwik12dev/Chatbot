package com.ava.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyOtpRequest(
        @NotBlank(message = "Email cannot be blank")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "OTP code cannot be blank")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        String otp
) {}
