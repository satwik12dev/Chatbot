package com.ava.search.service;

import com.ava.chat.dto.ChatMessageResponse;
import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.common.exception.ResourceNotFoundException;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.repository.ConversationRepository;
import com.ava.search.dto.SearchResponse;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public SearchService(ConversationRepository conversationRepository,
                         MessageRepository messageRepository,
                         UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public SearchResponse search(String userId, String query, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int fetchLimit = Math.min(Math.max(limit, 1), 50);

        Page<Conversation> conversations = conversationRepository.searchByTitle(user, query, PageRequest.of(0, fetchLimit));
        Page<Message> messages = messageRepository.searchByContent(user, query, PageRequest.of(0, fetchLimit));

        List<ConversationResponse> convResponses = conversations.getContent().stream()
                .map(ConversationResponse::from)
                .toList();

        List<ChatMessageResponse> msgResponses = messages.getContent().stream()
                .map(ChatMessageResponse::from)
                .toList();

        return new SearchResponse(query, convResponses, msgResponses);
    }
}
