package com.ava.search;

import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.repository.ConversationRepository;
import com.ava.search.dto.SearchResponse;
import com.ava.search.service.SearchService;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SearchService searchService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User("Satwik", "satwik@example.com", "hash");
        user.setId("user-1");
    }

    @Test
    @DisplayName("Should search across conversation titles and message content")
    void testSearch() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        Conversation c1 = new Conversation(user, "Spring Boot Architecture");
        c1.setId("c1");
        when(conversationRepository.searchByTitle(eq(user), eq("Spring"), any()))
                .thenReturn(new PageImpl<>(List.of(c1)));

        when(messageRepository.searchByContent(eq(user), eq("Spring"), any()))
                .thenReturn(new PageImpl<>(List.of()));

        SearchResponse response = searchService.search("user-1", "Spring", 10);

        assertThat(response.query()).isEqualTo("Spring");
        assertThat(response.matchedConversations()).hasSize(1);
        assertThat(response.matchedConversations().get(0).title()).isEqualTo("Spring Boot Architecture");
        assertThat(response.matchedMessages()).isEmpty();
    }
}
