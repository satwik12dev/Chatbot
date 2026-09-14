package com.ava.memory.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ExtractedMemoryDto(
        @JsonProperty("memories")
        List<MemoryItem> memories
) {
    public record MemoryItem(
            @JsonProperty("key") String key,
            @JsonProperty("value") String value,
            @JsonProperty("type") String type, // PREFERENCE, FACT, INSTRUCTION, PROFILE
            @JsonProperty("importance") int importance // 1 to 5
    ) {}
}
