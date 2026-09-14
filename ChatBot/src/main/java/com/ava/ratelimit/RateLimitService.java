package com.ava.ratelimit;

import com.ava.config.GeminiProperties;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimitService {

    private final GeminiProperties geminiProperties;
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitService(GeminiProperties geminiProperties) {
        this.geminiProperties = geminiProperties;
    }

    public boolean tryAcquire(String clientKey) {
        if (!geminiProperties.ratelimit().enabled()) {
            return true;
        }

        int capacity = geminiProperties.ratelimit().burstCapacity();
        int ratePerMinute = geminiProperties.ratelimit().requestsPerMinute();

        TokenBucket bucket = buckets.computeIfAbsent(clientKey, k -> new TokenBucket(capacity, ratePerMinute));
        return bucket.tryConsume();
    }

    private static class TokenBucket {
        private final long capacity;
        private final double refillRatePerMs;
        private double tokens;
        private long lastRefillTimestamp;

        public TokenBucket(long capacity, int ratePerMinute) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.refillRatePerMs = (double) ratePerMinute / 60000.0;
            this.lastRefillTimestamp = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long elapsed = now - lastRefillTimestamp;
            if (elapsed > 0) {
                tokens = Math.min(capacity, tokens + (elapsed * refillRatePerMs));
                lastRefillTimestamp = now;
            }
        }
    }
}
