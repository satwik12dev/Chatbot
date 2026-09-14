package com.ava.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    private static final Logger log = LoggerFactory.getLogger(AiConfig.class);

    @Bean
    @Primary
    public ChatClient chatClient(GoogleGenAiChatModel googleGenAiChatModel, GeminiProperties properties) {
        String model = (properties != null && properties.gemini() != null && properties.gemini().chatModel() != null)
                ? properties.gemini().chatModel()
                : "gemini-3.7-flash";
        log.info("Configuring primary ChatClient for Google Gemini with model: {}", model);
        return ChatClient.builder(googleGenAiChatModel)
                .defaultOptions(GoogleGenAiChatOptions.builder().model(model))
                .build();
    }
}
