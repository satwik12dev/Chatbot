package com.ava.chat;

import com.ava.ai.GeminiChatService;
import com.ava.ai.GeminiContextService;
import com.ava.ai.GeminiMemoryService;
import com.ava.chat.dto.ChatMessageRequest;
import com.ava.chat.dto.ChatMessageResponse;
import com.ava.chat.dto.MessageRole;
import com.ava.chat.dto.MessageType;
import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.chat.service.ChatService;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.service.ConversationService;
import com.ava.conversation.service.ConversationTitleService;
import com.ava.summary.service.ConversationSummaryService;
import com.ava.usage.service.AiUsageService;
import com.ava.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChatServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationService conversationService;

    @Mock
    private GeminiContextService contextService;

    @Mock
    private GeminiChatService geminiChatService;

    @Mock
    private GeminiMemoryService memoryService;

    @Mock
    private ConversationSummaryService summaryService;

    @Mock
    private ConversationTitleService titleService;

    @Mock
    private AiUsageService usageService;

    @InjectMocks
    private ChatService chatService;

    private User user;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        user = new User("Satwik", "satwik@example.com", "hash");
        user.setId("user-1");

        conversation = new Conversation(user, "Chat");
        conversation.setId("conv-1");
    }

    @Test
    @DisplayName("Should send chat message, invoke Gemini, and save assistant response")
    void testSendMessage() {
        when(conversationService.getValidatedConversation("user-1", "conv-1")).thenReturn(conversation);

        when(messageRepository.save(any(Message.class))).thenAnswer(inv -> inv.getArgument(0));

        when(contextService.buildPromptMessages(any(Conversation.class), anyString()))
                .thenReturn(List.of());

        GeminiChatService.GeminiResponseResult result = new GeminiChatService.GeminiResponseResult(
                "Hello Satwik! How can I assist you today?",
                "gemini-2.5-flash",
                15,
                12,
                27
        );
        when(geminiChatService.generateResponse(any())).thenReturn(result);

        Message savedAssistantMsg = new Message(conversation, MessageRole.ASSISTANT, result.content(), MessageType.TEXT);
        savedAssistantMsg.setId("asst-msg-1");
        savedAssistantMsg.setModel(result.model());
        savedAssistantMsg.setTotalTokens(result.totalTokens());
        when(messageRepository.save(any(Message.class))).thenReturn(savedAssistantMsg);

        ChatMessageResponse response = chatService.sendMessage("user-1", "conv-1", new ChatMessageRequest("Hello AVA"));

        assertThat(response).isNotNull();
        assertThat(response.content()).isEqualTo("Hello Satwik! How can I assist you today?");
        assertThat(response.role()).isEqualTo(MessageRole.ASSISTANT);
        verify(conversationService, times(1)).touchConversation("conv-1");
    }
}
