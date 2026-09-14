package com.ava.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import java.util.List;

@ConfigurationProperties(prefix = "ava")
public record GeminiProperties(
        Jwt jwt,
        Gemini gemini,
        Limits limits,
        Cors cors,
        Ratelimit ratelimit
) {
    public GeminiProperties {
        if (gemini == null) {
            gemini = new Gemini("gemini-3.5-flash", List.of("gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3-flash-preview"), "gemini-3.5-flash", "gemini-3.5-flash", 0.7, 4096, 30000L, 3);
        }
    }

    public record Jwt(
            String secret,
            long accessTokenExpirationMs,
            long refreshTokenExpirationMs
    ) {}

    public record Gemini(
            String chatModel,
            List<String> fallbackModels,
            String sttModel,
            String ttsModel,
            double temperature,
            int maxTokens,
            long timeoutMs,
            int maxRetries
    ) {
        public Gemini {
            if (chatModel == null || chatModel.isBlank()) {
                chatModel = "gemini-3.5-flash";
            }
            if (fallbackModels == null || fallbackModels.isEmpty()) {
                fallbackModels = List.of("gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3-flash-preview");
            }
            if (sttModel == null || sttModel.isBlank()) {
                sttModel = "gemini-3.5-flash";
            }
            if (ttsModel == null || ttsModel.isBlank()) {
                ttsModel = "gemini-3.5-flash";
            }
        }
    }

    public record Limits(
            int maxMessageLength,
            int maxAudioSizeMb,
            int maxContextMessages,
            int maxPageSize,
            int summaryThresholdMessages
    ) {}

    public record Cors(
            List<String> allowedOrigins
    ) {}

    public record Ratelimit(
            boolean enabled,
            int requestsPerMinute,
            int burstCapacity
    ) {}
}
