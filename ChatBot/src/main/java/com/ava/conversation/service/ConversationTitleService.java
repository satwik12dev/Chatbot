package com.ava.conversation.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class ConversationTitleService {

    private static final Logger log = LoggerFactory.getLogger(ConversationTitleService.class);

    private final ChatClient chatClient;
    private final ConversationService conversationService;

    public ConversationTitleService(ChatClient chatClient, ConversationService conversationService) {
        this.chatClient = chatClient;
        this.conversationService = conversationService;
    }

    @Async
    public void generateTitleIfDefaultAsync(String conversationId, String firstUserMessage) {
        try {
            String prompt = """
                    Generate a brief, clear, descriptive title (maximum 5 words, no quotes, no trailing period)
                    for a conversation that begins with this user message:
                    "%s"
                    """.formatted(firstUserMessage);

            String title = chatClient.prompt()
                    .system("You generate concise conversation titles. Output only the title text, nothing else.")
                    .user(prompt)
                    .call()
                    .content();

            if (title != null && !title.isBlank()) {
                String cleanTitle = title.replaceAll("[\"'\n\r]", "").trim();
                if (cleanTitle.length() > 60) {
                    cleanTitle = cleanTitle.substring(0, 60);
                }
                conversationService.updateTitleIfDefault(conversationId, cleanTitle);
                log.info("Generated title for conversationId {}: {}", conversationId, cleanTitle);
            }
        } catch (Exception ex) {
            log.warn("Title generation skipped or failed: {}", ex.getMessage());
        }
    }
}
