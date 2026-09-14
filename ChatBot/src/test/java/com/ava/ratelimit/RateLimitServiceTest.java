package com.ava.ratelimit;

import com.ava.config.GeminiProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitServiceTest {

    @Test
    @DisplayName("Should throttle requests once token bucket capacity is exhausted")
    void testRateLimiterThrottle() {
        GeminiProperties properties = new GeminiProperties(
                null,
                null,
                null,
                null,
                new GeminiProperties.Ratelimit(true, 60, 3) // capacity 3
        );

        RateLimitService rateLimiter = new RateLimitService(properties);

        String clientKey = "test-client-123";
        assertThat(rateLimiter.tryAcquire(clientKey)).isTrue();
        assertThat(rateLimiter.tryAcquire(clientKey)).isTrue();
        assertThat(rateLimiter.tryAcquire(clientKey)).isTrue();
        // 4th request must be rejected
        assertThat(rateLimiter.tryAcquire(clientKey)).isFalse();
    }
}
