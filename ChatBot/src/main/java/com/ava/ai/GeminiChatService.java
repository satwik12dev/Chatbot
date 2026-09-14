package com.ava.ai;

import com.ava.ai.tool.AvaToolRegistry;
import com.ava.common.exception.GeminiServiceException;
import com.ava.config.GeminiProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
public class GeminiChatService {

    private static final Logger log = LoggerFactory.getLogger(GeminiChatService.class);

    private final ChatClient chatClient;
    private final AvaToolRegistry toolRegistry;
    private final GeminiProperties geminiProperties;

    public GeminiChatService(ChatClient chatClient,
                             AvaToolRegistry toolRegistry,
                             GeminiProperties geminiProperties) {
        this.chatClient = chatClient;
        this.toolRegistry = toolRegistry;
        this.geminiProperties = geminiProperties;
    }

    public record GeminiResponseResult(
            String content,
            String model,
            int inputTokens,
            int outputTokens,
            int totalTokens
    ) {}

    public List<String> getModelFallbackChain() {
        LinkedHashSet<String> chain = new LinkedHashSet<>();

        String primary = geminiProperties.gemini().chatModel();
        if (primary != null && !primary.isBlank()) {
            chain.add(primary.trim());
        }

        List<String> fallbacks = geminiProperties.gemini().fallbackModels();
        if (fallbacks != null) {
            for (String f : fallbacks) {
                if (f != null && !f.isBlank()) {
                    chain.add(f.trim());
                }
            }
        }

        // Standard active fallback models
        chain.add("gemini-3.7-flash");
        chain.add("gemini-3.1-flash-lite");
        chain.add("gemini-3-flash-preview");
        chain.add("gemini-3.5-flash");
        chain.add("gemini-3.6-flash");

        return new ArrayList<>(chain);
    }

    public GoogleGenAiChatOptions buildChatOptions(String modelName) {
        GoogleGenAiChatOptions.Builder builder = GoogleGenAiChatOptions.builder()
                .temperature(geminiProperties.gemini().temperature());

        if (modelName != null && !modelName.isBlank()) {
            builder.model(modelName.trim());
        } else if (geminiProperties.gemini().chatModel() != null && !geminiProperties.gemini().chatModel().isBlank()) {
            builder.model(geminiProperties.gemini().chatModel().trim());
        }

        return builder.build();
    }

    public GeminiResponseResult generateResponse(List<Message> messages) {
        List<String> models = getModelFallbackChain();
        Exception lastException = null;

        for (int i = 0; i < models.size(); i++) {
            String currentModel = models.get(i);
            try {
                log.info("Attempting Gemini generation with model: {}", currentModel);
                Prompt prompt = new Prompt(messages, buildChatOptions(currentModel));

                ChatResponse chatResponse = chatClient.prompt(prompt)
                        .tools(toolRegistry.getAllTools())
                        .call()
                        .chatResponse();

                if (chatResponse == null || chatResponse.getResult() == null) {
                    throw new GeminiServiceException("Received empty response from Gemini model " + currentModel);
                }

                String content = chatResponse.getResult().getOutput().getText();
                if (content == null) {
                    content = "";
                }

                int inTokens = 0;
                int outTokens = 0;
                int totalTokens = 0;
                if (chatResponse.getMetadata() != null && chatResponse.getMetadata().getUsage() != null) {
                    inTokens = chatResponse.getMetadata().getUsage().getPromptTokens() != null
                            ? chatResponse.getMetadata().getUsage().getPromptTokens().intValue() : 0;
                    outTokens = chatResponse.getMetadata().getUsage().getCompletionTokens() != null
                            ? chatResponse.getMetadata().getUsage().getCompletionTokens().intValue() : 0;
                    totalTokens = chatResponse.getMetadata().getUsage().getTotalTokens() != null
                            ? chatResponse.getMetadata().getUsage().getTotalTokens().intValue() : (inTokens + outTokens);
                }

                log.info("Gemini response successful using model '{}'. Tokens: {} in, {} out, {} total",
                        currentModel, inTokens, outTokens, totalTokens);

                return new GeminiResponseResult(content, currentModel, inTokens, outTokens, totalTokens);

            } catch (Exception e) {
                lastException = e;
                int nextIndex = i + 1;
                if (nextIndex < models.size()) {
                    String nextModel = models.get(nextIndex);
                    log.warn("Gemini model '{}' failed ({}). Auto-switching to fallback model '{}'...",
                            currentModel, e.getMessage(), nextModel);
                } else {
                    log.error("All Gemini models in fallback chain failed. Last error on model '{}': {}",
                            currentModel, e.getMessage());
                }
            }
        }

        throw new GeminiServiceException("All Gemini models in fallback chain failed: " +
                (lastException != null ? lastException.getMessage() : "Unknown error"), lastException);
    }

    public Flux<ChatResponse> streamResponse(List<Message> messages) {
        List<String> models = getModelFallbackChain();
        return streamWithFallback(messages, models, 0);
    }

    private Flux<ChatResponse> streamWithFallback(List<Message> messages, List<String> models, int modelIndex) {
        if (modelIndex >= models.size()) {
            return Flux.error(new GeminiServiceException("All Gemini fallback models exhausted for streaming"));
        }

        String currentModel = models.get(modelIndex);
        log.info("Starting Gemini stream with model: {}", currentModel);

        Prompt prompt = new Prompt(messages, buildChatOptions(currentModel));

        Flux<ChatResponse> flux;
        try {
            flux = chatClient.prompt(prompt)
                    .tools(toolRegistry.getAllTools())
                    .stream()
                    .chatResponse();
        } catch (Exception ex) {
            int nextIndex = modelIndex + 1;
            if (nextIndex < models.size()) {
                String nextModel = models.get(nextIndex);
                log.warn("Failed to initiate Gemini stream for model '{}' ({}). Auto-switching to fallback model '{}'...",
                        currentModel, ex.getMessage(), nextModel);
                return streamWithFallback(messages, models, nextIndex);
            }
            return Flux.error(ex);
        }

        int nextIndex = modelIndex + 1;
        if (nextIndex < models.size()) {
            String nextModel = models.get(nextIndex);
            return flux.onErrorResume(error -> {
                log.warn("Gemini model '{}' failed during stream ({}). Auto-switching to fallback model '{}'...",
                        currentModel, error.getMessage(), nextModel);
                return streamWithFallback(messages, models, nextIndex);
            });
        }

        return flux;
    }
}
