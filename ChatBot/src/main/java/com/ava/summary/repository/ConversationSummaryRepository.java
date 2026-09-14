package com.ava.summary.repository;

import com.ava.conversation.entity.Conversation;
import com.ava.summary.entity.ConversationSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationSummaryRepository extends JpaRepository<ConversationSummary, String> {
    Optional<ConversationSummary> findByConversation(Conversation conversation);
    Optional<ConversationSummary> findByConversationId(String conversationId);
}
