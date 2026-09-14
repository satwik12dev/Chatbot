package com.ava.conversation.repository;

import com.ava.conversation.entity.Conversation;
import com.ava.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    Page<Conversation> findByUserAndArchivedOrderByUpdatedAtDesc(User user, boolean archived, Pageable pageable);

    Page<Conversation> findByUserOrderByUpdatedAtDesc(User user, Pageable pageable);

    Optional<Conversation> findByIdAndUser(String id, User user);

    boolean existsByIdAndUser(String id, User user);

    @Query("SELECT c FROM Conversation c WHERE c.user = :user AND LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.updatedAt DESC")
    Page<Conversation> searchByTitle(@Param("user") User user, @Param("query") String query, Pageable pageable);
}
