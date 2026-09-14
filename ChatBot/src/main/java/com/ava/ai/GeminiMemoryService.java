package com.ava.ai;

import com.ava.ai.tool.AvaToolRegistry;
import com.ava.memory.dto.ExtractedMemoryDto;
import com.ava.memory.service.UserMemoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class GeminiMemoryService {

    private static final Logger log = LoggerFactory.getLogger(GeminiMemoryService.class);

    private final ChatClient chatClient;
    private final UserMemoryService memoryService;

    public GeminiMemoryService(ChatClient chatClient, UserMemoryService memoryService) {
        this.chatClient = chatClient;
        this.memoryService = memoryService;
    }

    @Async
    public void extractAndSaveMemoriesAsync(String userId, String userMessage, String assistantResponse) {
        try {
            String prompt = """
                    Analyze the following user statement and assistant response.
                    Identify any enduring user facts, preferences, constraints, instructions, or profile attributes.
                    
                    Rules:
                    - Only extract clear, long-term relevant information (e.g., name, preferred style, domain expertise, programming languages, permanent constraints).
                    - Do not extract transient questions or one-time ephemeral tasks.
                    - If no new long-term memories are found, return an empty memories list.
                    
                    User: %s
                    Assistant: %s
                    """.formatted(userMessage, assistantResponse);

            ExtractedMemoryDto extracted = chatClient.prompt()
                    .system("You are an expert memory extraction engine. Output strictly valid JSON matching the requested structure.")
                    .user(prompt)
                    .call()
                    .entity(ExtractedMemoryDto.class);

            if (extracted != null && extracted.memories() != null && !extracted.memories().isEmpty()) {
                memoryService.applyExtractedMemories(userId, extracted);
            }
        } catch (Exception ex) {
            log.warn("Memory extraction failed or skipped: {}", ex.getMessage());
        }
    }
}
