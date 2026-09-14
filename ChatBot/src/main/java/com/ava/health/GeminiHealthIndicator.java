package com.ava.health;

import com.ava.config.GeminiProperties;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class GeminiHealthIndicator implements HealthIndicator {

    private final GeminiProperties geminiProperties;

    public GeminiHealthIndicator(GeminiProperties geminiProperties) {
        this.geminiProperties = geminiProperties;
    }

    @Override
    public Health health() {
        if (geminiProperties.gemini() == null || geminiProperties.gemini().chatModel() == null) {
            return Health.down()
                    .withDetail("geminiProvider", "Google Gemini")
                    .withDetail("error", "Gemini chat model not configured")
                    .build();
        }

        return Health.up()
                .withDetail("aiProvider", "Google Gemini API")
                .withDetail("chatModel", geminiProperties.gemini().chatModel())
                .withDetail("sttModel", geminiProperties.gemini().sttModel())
                .withDetail("ttsModel", geminiProperties.gemini().ttsModel())
                .withDetail("status", "Configured & Ready")
                .build();
    }
}
