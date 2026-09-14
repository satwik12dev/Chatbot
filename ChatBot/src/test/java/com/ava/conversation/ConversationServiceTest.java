package com.ava.conversation;

import com.ava.common.exception.UnauthorizedException;
import com.ava.conversation.dto.CreateConversationRequest;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.dto.UpdateConversationRequest;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.repository.ConversationRepository;
import com.ava.conversation.service.ConversationService;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ConversationService conversationService;

    private User owner;
    private User anotherUser;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        owner = new User("Alice", "alice@example.com", "hash");
        owner.setId("owner-1");

        anotherUser = new User("Bob", "bob@example.com", "hash");
        anotherUser.setId("intruder-2");

        conversation = new Conversation(owner, "My Chat");
        conversation.setId("conv-123");
    }

    @Test
    @DisplayName("Should create conversation for user successfully")
    void testCreateConversation() {
        when(userRepository.findById("owner-1")).thenReturn(Optional.of(owner));
        when(conversationRepository.save(any(Conversation.class))).thenReturn(conversation);

        ConversationResponse response = conversationService.createConversation("owner-1", new CreateConversationRequest("My Chat"));

        assertThat(response.id()).isEqualTo("conv-123");
        assertThat(response.title()).isEqualTo("My Chat");
        assertThat(response.userId()).isEqualTo("owner-1");
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when another user attempts to access conversation")
    void testUserIsolation() {
        when(conversationRepository.findById("conv-123")).thenReturn(Optional.of(conversation));

        assertThatThrownBy(() -> conversationService.getConversation("intruder-2", "conv-123"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("permission");
    }

    @Test
    @DisplayName("Should update conversation title and archive status")
    void testUpdateConversation() {
        when(conversationRepository.findById("conv-123")).thenReturn(Optional.of(conversation));
        when(conversationRepository.save(any(Conversation.class))).thenReturn(conversation);

        ConversationResponse updated = conversationService.updateConversation(
                "owner-1", "conv-123", new UpdateConversationRequest("Renamed Title", true));

        assertThat(conversation.getTitle()).isEqualTo("Renamed Title");
        assertThat(conversation.isArchived()).isTrue();
    }
}
