package com.ava.usage.repository;

import com.ava.usage.entity.AiUsage;
import com.ava.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiUsageRepository extends JpaRepository<AiUsage, String> {
    Page<AiUsage> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
