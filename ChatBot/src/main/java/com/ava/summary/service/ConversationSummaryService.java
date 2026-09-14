package com.ava.summary.service;

import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.config.GeminiProperties;
import com.ava.conversation.entity.Conversation;
import com.ava.summary.entity.ConversationSummary;
import com.ava.summary.repository.ConversationSummaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ConversationSummaryService {

    private static final Logger log = LoggerFactory.getLogger(ConversationSummaryService.class);

    private final ConversationSummaryRepository summaryRepository;
    private final MessageRepository messageRepository;
    private final ChatClient chatClient;
    private final GeminiProperties geminiProperties;

    public ConversationSummaryService(ConversationSummaryRepository summaryRepository,
                                      MessageRepository messageRepository,
                                      ChatClient chatClient,
                                      GeminiProperties geminiProperties) {
        this.summaryRepository = summaryRepository;
        this.messageRepository = messageRepository;
        this.chatClient = chatClient;
        this.geminiProperties = geminiProperties;
    }

    @Async
    @Transactional
    public void checkAndSummarizeAsync(Conversation conversation) {
        try {
            long totalMessages = messageRepository.countByConversation(conversation);
            int threshold = geminiProperties.limits().summaryThresholdMessages();

            if (totalMessages < threshold) {
                return;
            }

            // Retrieve messages to summarize
            List<Message> messages = messageRepository.findTop50ByConversationOrderByCreatedAtDesc(conversation);
            if (messages.isEmpty()) {
                return;
            }

            StringBuilder conversationLog = new StringBuilder();
            for (int i = messages.size() - 1; i >= 0; i--) {
                Message m = messages.get(i);
                conversationLog.append(m.getRole()).append(": ").append(m.getContent()).append("\n");
            }

            String prompt = """
                    Summarize the following conversation history concisely into 2-4 sentences,
                    capturing all key topics, user intents, and outcomes so far.
                    
                    Conversation:
                    %s
                    """.formatted(conversationLog.toString());

            String summaryText = chatClient.prompt()
                    .system("You are an expert conversation summarizer. Summarize factually and concisely.")
                    .user(prompt)
                    .call()
                    .content();

            if (summaryText != null && !summaryText.isBlank()) {
                ConversationSummary summary = summaryRepository.findByConversation(conversation)
                        .orElseGet(() -> new ConversationSummary(conversation, "", null, 0));

                summary.setSummary(summaryText.trim());
                summary.setLastSummarizedMessageId(messages.get(0).getId());
                summary.setMessageCount((int) totalMessages);
                summaryRepository.save(summary);

                log.info("Updated conversation summary for conversationId={}", conversation.getId());
            }
        } catch (Exception ex) {
            log.warn("Conversation summarization skipped or failed: {}", ex.getMessage());
        }
    }
}
