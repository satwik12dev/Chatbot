package com.ava.conversation.service;

import com.ava.common.exception.ResourceNotFoundException;
import com.ava.common.exception.UnauthorizedException;
import com.ava.common.response.PagedResponse;
import com.ava.conversation.dto.CreateConversationRequest;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.dto.UpdateConversationRequest;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.repository.ConversationRepository;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public ConversationService(ConversationRepository conversationRepository, UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConversationResponse createConversation(String userId, CreateConversationRequest request) {
        User user = getUser(userId);
        String title = (request != null && request.title() != null && !request.title().isBlank())
                ? request.title().trim()
                : "New Conversation";
        Conversation conversation = new Conversation(user, title);
        conversation = conversationRepository.save(conversation);
        return ConversationResponse.from(conversation);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ConversationResponse> getConversations(String userId, Boolean archived, int page, int size) {
        User user = getUser(userId);
        Pageable pageable = PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Conversation> convPage;

        if (archived != null) {
            convPage = conversationRepository.findByUserAndArchivedOrderByUpdatedAtDesc(user, archived, pageable);
        } else {
            convPage = conversationRepository.findByUserOrderByUpdatedAtDesc(user, pageable);
        }

        Page<ConversationResponse> responsePage = convPage.map(ConversationResponse::from);
        return PagedResponse.from(responsePage);
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(String userId, String conversationId) {
        Conversation conversation = getValidatedConversation(userId, conversationId);
        return ConversationResponse.from(conversation);
    }

    @Transactional
    public ConversationResponse updateConversation(String userId, String conversationId, UpdateConversationRequest request) {
        Conversation conversation = getValidatedConversation(userId, conversationId);

        if (request.title() != null && !request.title().isBlank()) {
            conversation.setTitle(request.title().trim());
        }
        if (request.archived() != null) {
            conversation.setArchived(request.archived());
        }

        conversation = conversationRepository.save(conversation);
        return ConversationResponse.from(conversation);
    }

    @Transactional
    public void deleteConversation(String userId, String conversationId) {
        Conversation conversation = getValidatedConversation(userId, conversationId);
        conversationRepository.delete(conversation);
    }

    @Transactional
    public void touchConversation(String conversationId) {
        conversationRepository.findById(conversationId).ifPresent(c -> {
            c.setUpdatedAt(java.time.Instant.now());
            conversationRepository.save(c);
        });
    }

    @Transactional
    public void updateTitleIfDefault(String conversationId, String newTitle) {
        conversationRepository.findById(conversationId).ifPresent(c -> {
            if ("New Conversation".equals(c.getTitle()) && newTitle != null && !newTitle.isBlank()) {
                c.setTitle(newTitle.trim());
                conversationRepository.save(c);
            }
        });
    }

    public Conversation getValidatedConversation(String userId, String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", conversationId));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You do not have permission to access this conversation");
        }

        return conversation;
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
