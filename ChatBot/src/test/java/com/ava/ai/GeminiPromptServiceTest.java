package com.ava.ai;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GeminiPromptServiceTest {

    private final GeminiPromptService promptService = new GeminiPromptService();

    @Test
    @DisplayName("Should return base system prompt containing AVA persona and rules")
    void testBasePrompt() {
        String basePrompt = promptService.getBaseSystemPrompt();
        assertThat(basePrompt).isNotBlank();
        assertThat(basePrompt).contains("AVA");
        assertThat(basePrompt).contains("Google Gemini");
        assertThat(basePrompt).contains("Calculator, Weather, Time");
    }

    @Test
    @DisplayName("Should combine memory and summary context into system prompt")
    void testPromptWithContext() {
        String memoryContext = "User likes Java 24 and concise answers.";
        String summaryContext = "Discussed Spring Boot and Flyway.";

        String assembled = promptService.buildSystemPromptWithContext(memoryContext, summaryContext);

        assertThat(assembled).contains("AVA");
        assertThat(assembled).contains("--- PREVIOUS CONVERSATION SUMMARY ---");
        assertThat(assembled).contains("Discussed Spring Boot and Flyway.");
        assertThat(assembled).contains("--- USER PERSONAL CONTEXT & MEMORY ---");
        assertThat(assembled).contains("User likes Java 24 and concise answers.");
    }
}
