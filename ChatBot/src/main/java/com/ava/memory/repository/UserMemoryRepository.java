package com.ava.memory.repository;

import com.ava.memory.entity.UserMemory;
import com.ava.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMemoryRepository extends JpaRepository<UserMemory, String> {
    List<UserMemory> findByUserOrderByImportanceDescUpdatedAtDesc(User user);
    Optional<UserMemory> findByUserAndMemoryKey(User user, String memoryKey);
    Optional<UserMemory> findByIdAndUser(String id, User user);
    void deleteByUser(User user);
}
