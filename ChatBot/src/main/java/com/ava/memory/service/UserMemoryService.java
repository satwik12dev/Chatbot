package com.ava.memory.service;

import com.ava.common.exception.ResourceNotFoundException;
import com.ava.common.exception.UnauthorizedException;
import com.ava.memory.dto.ExtractedMemoryDto;
import com.ava.memory.dto.MemoryResponse;
import com.ava.memory.dto.MemoryType;
import com.ava.memory.entity.UserMemory;
import com.ava.memory.repository.UserMemoryRepository;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserMemoryService {

    private static final Logger log = LoggerFactory.getLogger(UserMemoryService.class);

    private final UserMemoryRepository memoryRepository;
    private final UserRepository userRepository;

    public UserMemoryService(UserMemoryRepository memoryRepository, UserRepository userRepository) {
        this.memoryRepository = memoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<MemoryResponse> getUserMemories(String userId) {
        User user = getUser(userId);
        return memoryRepository.findByUserOrderByImportanceDescUpdatedAtDesc(user)
                .stream()
                .map(MemoryResponse::from)
                .toList();
    }

    @Transactional
    public void deleteMemory(String userId, String memoryId) {
        User user = getUser(userId);
        UserMemory memory = memoryRepository.findById(memoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Memory", "id", memoryId));

        if (!memory.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not have permission to delete this memory");
        }

        memoryRepository.delete(memory);
    }

    @Transactional
    public void deleteAllMemories(String userId) {
        User user = getUser(userId);
        memoryRepository.deleteByUser(user);
    }

    @Transactional
    public void saveMemory(String userId, String key, String value, MemoryType type, int importance) {
        User user = getUser(userId);
        String cleanKey = key.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "_");
        if (cleanKey.length() > 100) cleanKey = cleanKey.substring(0, 100);

        Optional<UserMemory> existing = memoryRepository.findByUserAndMemoryKey(user, cleanKey);
        if (existing.isPresent()) {
            UserMemory memory = existing.get();
            memory.setMemoryValue(value.trim());
            memory.setMemoryType(type != null ? type : MemoryType.FACT);
            memory.setImportance(Math.clamp(importance, 1, 5));
            memoryRepository.save(memory);
        } else {
            UserMemory memory = new UserMemory(user, cleanKey, value.trim(), type, importance);
            memoryRepository.save(memory);
        }
    }

    @Transactional
    public void applyExtractedMemories(String userId, ExtractedMemoryDto dto) {
        if (dto == null || dto.memories() == null || dto.memories().isEmpty()) {
            return;
        }

        for (ExtractedMemoryDto.MemoryItem item : dto.memories()) {
            if (item.key() == null || item.key().isBlank() || item.value() == null || item.value().isBlank()) {
                continue;
            }

            MemoryType type = MemoryType.FACT;
            if (item.type() != null) {
                try {
                    type = MemoryType.valueOf(item.type().toUpperCase());
                } catch (IllegalArgumentException ignored) {
                    type = MemoryType.FACT;
                }
            }

            saveMemory(userId, item.key(), item.value(), type, item.importance());
            log.info("Saved persistent memory for user {}: {} = {}", userId, item.key(), item.value());
        }
    }

    @Transactional(readOnly = true)
    public String getFormattedMemoriesForContext(String userId) {
        User user = getUser(userId);
        List<UserMemory> memories = memoryRepository.findByUserOrderByImportanceDescUpdatedAtDesc(user);
        if (memories.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("User Long-Term Memory (Persistent Facts and Preferences):\n");
        for (UserMemory m : memories) {
            sb.append("- [").append(m.getMemoryType()).append("] ")
              .append(m.getMemoryKey()).append(": ")
              .append(m.getMemoryValue()).append("\n");
        }
        return sb.toString();
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
