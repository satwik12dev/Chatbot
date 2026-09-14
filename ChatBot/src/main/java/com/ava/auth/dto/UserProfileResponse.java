package com.ava.auth.dto;

import com.ava.user.entity.User;
import java.time.Instant;

public record UserProfileResponse(
        String id,
        String name,
        String email,
        Instant createdAt
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCreatedAt()
        );
    }
}
