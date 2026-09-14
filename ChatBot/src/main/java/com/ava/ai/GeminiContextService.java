package com.ava.ai;

import com.ava.chat.dto.MessageRole;
import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.config.GeminiProperties;
import com.ava.conversation.entity.Conversation;
import com.ava.memory.service.UserMemoryService;
import com.ava.summary.repository.ConversationSummaryRepository;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class GeminiContextService {

    private final GeminiPromptService promptService;
    private final UserMemoryService memoryService;
    private final ConversationSummaryRepository summaryRepository;
    private final MessageRepository messageRepository;
    private final GeminiProperties geminiProperties;

    public GeminiContextService(GeminiPromptService promptService,
                                UserMemoryService memoryService,
                                ConversationSummaryRepository summaryRepository,
                                MessageRepository messageRepository,
                                GeminiProperties geminiProperties) {
        this.promptService = promptService;
        this.memoryService = memoryService;
        this.summaryRepository = summaryRepository;
        this.messageRepository = messageRepository;
        this.geminiProperties = geminiProperties;
    }

    public List<org.springframework.ai.chat.messages.Message> buildPromptMessages(Conversation conversation, String currentUserMessageContent) {
        String userId = conversation.getUser().getId();

        // 1. Get long-term memories
        String memoryContext = memoryService.getFormattedMemoriesForContext(userId);

        // 2. Get conversation summary
        String summaryContext = summaryRepository.findByConversation(conversation)
                .map(s -> s.getSummary())
                .orElse("");

        // 3. Assemble unified system instructions
        String systemInstruction = promptService.buildSystemPromptWithContext(memoryContext, summaryContext);

        List<org.springframework.ai.chat.messages.Message> promptMessages = new ArrayList<>();
        promptMessages.add(new SystemMessage(systemInstruction));

        // 4. Retrieve recent history (sliding window up to maxContextMessages)
        int maxMessages = geminiProperties.limits().maxContextMessages();
        List<Message> recentHistory = messageRepository.findTop50ByConversationOrderByCreatedAtDesc(conversation);

        // Reverse so that messages are chronological (oldest to newest)
        List<Message> chronological = new ArrayList<>(recentHistory);
        Collections.reverse(chronological);

        if (chronological.size() > maxMessages) {
            chronological = chronological.subList(chronological.size() - maxMessages, chronological.size());
        }

        for (Message msg : chronological) {
            if (msg.getRole() == MessageRole.USER) {
                promptMessages.add(new UserMessage(msg.getContent()));
            } else if (msg.getRole() == MessageRole.ASSISTANT) {
                promptMessages.add(new AssistantMessage(msg.getContent()));
            }
        }

        // 5. Add current user message
        if (currentUserMessageContent != null && !currentUserMessageContent.isBlank()) {
            promptMessages.add(new UserMessage(currentUserMessageContent));
        }

        return promptMessages;
    }
}
