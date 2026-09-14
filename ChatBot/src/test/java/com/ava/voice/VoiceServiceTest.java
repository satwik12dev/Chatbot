package com.ava.voice;

import com.ava.ai.GeminiChatService;
import com.ava.ai.GeminiContextService;
import com.ava.ai.GeminiMemoryService;
import com.ava.chat.dto.MessageRole;
import com.ava.chat.dto.MessageType;
import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.dto.CreateConversationRequest;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.service.ConversationService;
import com.ava.conversation.service.ConversationTitleService;
import com.ava.summary.service.ConversationSummaryService;
import com.ava.usage.service.AiUsageService;
import com.ava.user.entity.User;
import com.ava.voice.dto.SpeechResponse;
import com.ava.voice.dto.TranscriptionResponse;
import com.ava.voice.dto.VoiceChatResponse;
import com.ava.voice.service.VoiceService;
import com.ava.voice.storage.AudioStorageService;
import com.ava.voice.stt.GeminiSttService;
import com.ava.voice.tts.GeminiTtsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoiceServiceTest {

    @Mock
    private AudioStorageService audioStorageService;

    @Mock
    private GeminiSttService geminiSttService;

    @Mock
    private GeminiTtsService geminiTtsService;

    @Mock
    private ConversationService conversationService;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private GeminiContextService contextService;

    @Mock
    private GeminiChatService geminiChatService;

    @Mock
    private GeminiMemoryService memoryService;

    @Mock
    private ConversationSummaryService summaryService;

    @Mock
    private ConversationTitleService titleService;

    @Mock
    private AiUsageService usageService;

    @InjectMocks
    private VoiceService voiceService;

    private User user;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        user = new User("Satwik", "satwik@example.com", "hash");
        user.setId("user-1");

        conversation = new Conversation(user, "Voice Chat");
        conversation.setId("conv-1");
    }

    @Test
    @DisplayName("Should transcribe audio file using Gemini STT")
    void testTranscribe() {
        MockMultipartFile audioFile = new MockMultipartFile("audio", "speech.wav", "audio/wav", new byte[]{1, 2, 3});

        when(audioStorageService.validateAndReadAudioBytes(audioFile)).thenReturn(new byte[]{1, 2, 3});
        when(audioStorageService.resolveMimeType(audioFile)).thenReturn("audio/wav");
        when(geminiSttService.transcribeAudio(any(), eq("audio/wav"))).thenReturn("What is Spring Boot?");

        TranscriptionResponse response = voiceService.transcribe(audioFile);

        assertThat(response.transcribedText()).isEqualTo("What is Spring Boot?");
        assertThat(response.audioFormat()).isEqualTo("audio/wav");
    }

    @Test
    @DisplayName("Should process voice chat with Gemini STT, chat generation, and TTS synthesis")
    void testVoiceChat() {
        MockMultipartFile audioFile = new MockMultipartFile("audio", "speech.wav", "audio/wav", new byte[]{1, 2, 3});

        when(audioStorageService.validateAndReadAudioBytes(audioFile)).thenReturn(new byte[]{1, 2, 3});
        when(audioStorageService.resolveMimeType(audioFile)).thenReturn("audio/wav");
        when(geminiSttService.transcribeAudio(any(), eq("audio/wav"))).thenReturn("Explain Spring AI");

        when(conversationService.getValidatedConversation("user-1", "conv-1")).thenReturn(conversation);

        Message savedMsg = new Message(conversation, MessageRole.ASSISTANT, "Spring AI is...", MessageType.VOICE);
        savedMsg.setId("asst-1");
        when(messageRepository.save(any(Message.class))).thenReturn(savedMsg);

        GeminiChatService.GeminiResponseResult result = new GeminiChatService.GeminiResponseResult(
                "Spring AI is a project that simplifies building AI applications.",
                "gemini-2.5-flash",
                20,
                30,
                50
        );
        when(geminiChatService.generateResponse(any())).thenReturn(result);
        when(geminiTtsService.synthesizeSpeech(any())).thenReturn(new byte[]{10, 20, 30});

        VoiceChatResponse response = voiceService.voiceChat("user-1", "conv-1", audioFile);

        assertThat(response).isNotNull();
        assertThat(response.transcribedUserText()).isEqualTo("Explain Spring AI");
        assertThat(response.audioUrl()).startsWith("data:audio/wav;base64,");
    }

    @Test
    @DisplayName("Should synthesize text into audio payload")
    void testSynthesize() {
        when(geminiTtsService.synthesizeSpeech("Hello world")).thenReturn(new byte[]{5, 6, 7});

        SpeechResponse response = voiceService.synthesize("Hello world");

        assertThat(response.audioData()).containsExactly(5, 6, 7);
        assertThat(response.audioFormat()).isEqualTo("audio/wav");
    }
}
