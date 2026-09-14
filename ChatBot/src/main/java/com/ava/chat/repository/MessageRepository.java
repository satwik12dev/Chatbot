package com.ava.chat.repository;

import com.ava.chat.entity.Message;
import com.ava.conversation.entity.Conversation;
import com.ava.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    Page<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation, Pageable pageable);

    Page<Message> findByConversationOrderByCreatedAtDesc(Conversation conversation, Pageable pageable);

    List<Message> findTop50ByConversationOrderByCreatedAtDesc(Conversation conversation);

    long countByConversation(Conversation conversation);

    @Query("SELECT m FROM Message m WHERE m.conversation.user = :user AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY m.createdAt DESC")
    Page<Message> searchByContent(@Param("user") User user, @Param("query") String query, Pageable pageable);
}
