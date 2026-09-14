package com.ava.memory;

import com.ava.memory.dto.ExtractedMemoryDto;
import com.ava.memory.dto.MemoryType;
import com.ava.memory.entity.UserMemory;
import com.ava.memory.repository.UserMemoryRepository;
import com.ava.memory.service.UserMemoryService;
import com.ava.user.entity.User;
import com.ava.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserMemoryServiceTest {

    @Mock
    private UserMemoryRepository memoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserMemoryService memoryService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("Satwik", "satwik@example.com", "hash");
        testUser.setId("user-123");
    }

    @Test
    @DisplayName("Should save a new user memory if key does not exist")
    void testSaveNewMemory() {
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        when(memoryRepository.findByUserAndMemoryKey(testUser, "coding_style")).thenReturn(Optional.empty());

        memoryService.saveMemory("user-123", "coding_style", "Prefers Java 24 records", MemoryType.PREFERENCE, 5);

        verify(memoryRepository, times(1)).save(any(UserMemory.class));
    }

    @Test
    @DisplayName("Should apply extracted memories from Gemini structured output")
    void testApplyExtractedMemories() {
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        when(memoryRepository.findByUserAndMemoryKey(any(), any())).thenReturn(Optional.empty());

        ExtractedMemoryDto dto = new ExtractedMemoryDto(List.of(
                new ExtractedMemoryDto.MemoryItem("favorite_language", "Java", "FACT", 4)
        ));

        memoryService.applyExtractedMemories("user-123", dto);

        verify(memoryRepository, times(1)).save(any(UserMemory.class));
    }

    @Test
    @DisplayName("Should format memories for prompt context")
    void testGetFormattedMemories() {
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        UserMemory m1 = new UserMemory(testUser, "fav_food", "Pizza", MemoryType.PREFERENCE, 3);
        when(memoryRepository.findByUserOrderByImportanceDescUpdatedAtDesc(testUser)).thenReturn(List.of(m1));

        String formatted = memoryService.getFormattedMemoriesForContext("user-123");

        assertThat(formatted).contains("User Long-Term Memory");
        assertThat(formatted).contains("fav_food: Pizza");
    }
}
