package com.ava.voice.service;

import com.ava.ai.GeminiChatService;
import com.ava.ai.GeminiContextService;
import com.ava.ai.GeminiMemoryService;
import com.ava.chat.dto.ChatMessageResponse;
import com.ava.chat.dto.MessageRole;
import com.ava.chat.dto.MessageType;
import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.conversation.dto.CreateConversationRequest;
import com.ava.conversation.dto.ConversationResponse;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.service.ConversationService;
import com.ava.conversation.service.ConversationTitleService;
import com.ava.summary.service.ConversationSummaryService;
import com.ava.usage.service.AiUsageService;
import com.ava.voice.dto.SpeechResponse;
import com.ava.voice.dto.TranscriptionResponse;
import com.ava.voice.dto.VoiceChatResponse;
import com.ava.voice.storage.AudioStorageService;
import com.ava.voice.stt.GeminiSttService;
import com.ava.voice.tts.GeminiTtsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;

@Service
public class VoiceService {

    private static final Logger log = LoggerFactory.getLogger(VoiceService.class);

    private final AudioStorageService audioStorageService;
    private final GeminiSttService geminiSttService;
    private final GeminiTtsService geminiTtsService;
    private final ConversationService conversationService;
    private final MessageRepository messageRepository;
    private final GeminiContextService contextService;
    private final GeminiChatService geminiChatService;
    private final GeminiMemoryService memoryService;
    private final ConversationSummaryService summaryService;
    private final ConversationTitleService titleService;
    private final AiUsageService usageService;

    public VoiceService(AudioStorageService audioStorageService,
                        GeminiSttService geminiSttService,
                        GeminiTtsService geminiTtsService,
                        ConversationService conversationService,
                        MessageRepository messageRepository,
                        GeminiContextService contextService,
                        GeminiChatService geminiChatService,
                        GeminiMemoryService memoryService,
                        ConversationSummaryService summaryService,
                        ConversationTitleService titleService,
                        AiUsageService usageService) {
        this.audioStorageService = audioStorageService;
        this.geminiSttService = geminiSttService;
        this.geminiTtsService = geminiTtsService;
        this.conversationService = conversationService;
        this.messageRepository = messageRepository;
        this.contextService = contextService;
        this.geminiChatService = geminiChatService;
        this.memoryService = memoryService;
        this.summaryService = summaryService;
        this.titleService = titleService;
        this.usageService = usageService;
    }

    public TranscriptionResponse transcribe(MultipartFile audioFile) {
        long startTime = System.currentTimeMillis();
        byte[] audioBytes = audioStorageService.validateAndReadAudioBytes(audioFile);
        String mimeType = audioStorageService.resolveMimeType(audioFile);

        String transcribedText = geminiSttService.transcribeAudio(audioBytes, mimeType);
        long duration = System.currentTimeMillis() - startTime;

        return new TranscriptionResponse(transcribedText, mimeType, duration);
    }

    @Transactional
    public VoiceChatResponse voiceChat(String userId, String conversationId, MultipartFile audioFile) {
        // 1. Transcribe incoming user speech
        TranscriptionResponse transcription = transcribe(audioFile);
        String userSpeechText = transcription.transcribedText();
        if (userSpeechText == null || userSpeechText.isBlank()) {
            userSpeechText = "[Audio message received]";
        }

        // 2. Resolve or create conversation
        Conversation conversation;
        if (conversationId == null || conversationId.isBlank()) {
            ConversationResponse newConv = conversationService.createConversation(userId, new CreateConversationRequest("Voice Chat"));
            conversation = conversationService.getValidatedConversation(userId, newConv.id());
        } else {
            conversation = conversationService.getValidatedConversation(userId, conversationId);
        }

        // 3. Save user spoken message as MessageType.VOICE
        Message userMsg = new Message(conversation, MessageRole.USER, userSpeechText, MessageType.VOICE);
        userMsg = messageRepository.save(userMsg);

        // 4. Build context
        List<org.springframework.ai.chat.messages.Message> promptMessages =
                contextService.buildPromptMessages(conversation, userSpeechText);

        // 5. Generate Gemini assistant response
        GeminiChatService.GeminiResponseResult result = geminiChatService.generateResponse(promptMessages);

        // 6. Save assistant response
        Message assistantMsg = new Message(conversation, MessageRole.ASSISTANT, result.content(), MessageType.VOICE);
        assistantMsg.setModel(result.model());
        assistantMsg.setInputTokens(result.inputTokens());
        assistantMsg.setOutputTokens(result.outputTokens());
        assistantMsg.setTotalTokens(result.totalTokens());
        assistantMsg = messageRepository.save(assistantMsg);

        // 7. Synthesize speech audio response via Gemini TTS
        byte[] speechBytes = geminiTtsService.synthesizeSpeech(result.content());
        String audioDataUri = "data:audio/wav;base64," + Base64.getEncoder().encodeToString(speechBytes);

        // 8. Update conversation & trigger intelligence tasks
        conversationService.touchConversation(conversation.getId());
        usageService.recordUsage(conversation.getUser(), conversation.getId(), result.model(), "VOICE_CHAT", result.inputTokens(), result.outputTokens());

        long count = messageRepository.countByConversation(conversation);
        if (count <= 2) {
            titleService.generateTitleIfDefaultAsync(conversation.getId(), userSpeechText);
        }
        memoryService.extractAndSaveMemoriesAsync(userId, userSpeechText, result.content());
        summaryService.checkAndSummarizeAsync(conversation);

        return new VoiceChatResponse(
                conversation.getId(),
                userSpeechText,
                ChatMessageResponse.from(assistantMsg),
                audioDataUri,
                "audio/wav"
        );
    }

    public SpeechResponse synthesize(String text) {
        byte[] audioBytes = geminiTtsService.synthesizeSpeech(text);
        return new SpeechResponse(text, "audio/wav", audioBytes);
    }
}
