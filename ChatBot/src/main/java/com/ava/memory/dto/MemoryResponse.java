package com.ava.memory.dto;

import com.ava.memory.entity.UserMemory;
import java.time.Instant;

public record MemoryResponse(
        String id,
        String memoryKey,
        String memoryValue,
        MemoryType memoryType,
        int importance,
        Instant createdAt,
        Instant updatedAt
) {
    public static MemoryResponse from(UserMemory m) {
        return new MemoryResponse(
                m.getId(),
                m.getMemoryKey(),
                m.getMemoryValue(),
                m.getMemoryType(),
                m.getImportance(),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }
}
