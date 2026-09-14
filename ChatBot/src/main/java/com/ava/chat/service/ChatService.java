package com.ava.chat.service;

import com.ava.ai.GeminiChatService;
import com.ava.ai.GeminiContextService;
import com.ava.ai.GeminiMemoryService;
import com.ava.chat.dto.ChatMessageRequest;
import com.ava.chat.dto.ChatMessageResponse;
import com.ava.chat.dto.MessageRole;
import com.ava.chat.dto.MessageType;
import com.ava.chat.dto.StreamChunkEvent;
import com.ava.chat.entity.Message;
import com.ava.chat.repository.MessageRepository;
import com.ava.common.response.PagedResponse;
import com.ava.conversation.entity.Conversation;
import com.ava.conversation.service.ConversationService;
import com.ava.conversation.service.ConversationTitleService;
import com.ava.summary.service.ConversationSummaryService;
import com.ava.usage.service.AiUsageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final MessageRepository messageRepository;
    private final ConversationService conversationService;
    private final GeminiContextService contextService;
    private final GeminiChatService geminiChatService;
    private final GeminiMemoryService memoryService;
    private final ConversationSummaryService summaryService;
    private final ConversationTitleService titleService;
    private final AiUsageService usageService;
    private final com.ava.config.GeminiProperties geminiProperties;

    public ChatService(MessageRepository messageRepository,
                       ConversationService conversationService,
                       GeminiContextService contextService,
                       GeminiChatService geminiChatService,
                       GeminiMemoryService memoryService,
                       ConversationSummaryService summaryService,
                       ConversationTitleService titleService,
                       AiUsageService usageService,
                       com.ava.config.GeminiProperties geminiProperties) {
        this.messageRepository = messageRepository;
        this.conversationService = conversationService;
        this.contextService = contextService;
        this.geminiChatService = geminiChatService;
        this.memoryService = memoryService;
        this.summaryService = summaryService;
        this.titleService = titleService;
        this.usageService = usageService;
        this.geminiProperties = geminiProperties;
    }

    @Transactional
    public ChatMessageResponse sendMessage(String userId, String conversationId, ChatMessageRequest request) {
        Conversation conversation = conversationService.getValidatedConversation(userId, conversationId);

        // 1. Save user message
        Message userMsg = new Message(conversation, MessageRole.USER, request.message().trim(), MessageType.TEXT);
        userMsg = messageRepository.save(userMsg);

        // 2. Build Gemini context
        List<org.springframework.ai.chat.messages.Message> promptMessages =
                contextService.buildPromptMessages(conversation, userMsg.getContent());

        // 3. Call Gemini
        GeminiChatService.GeminiResponseResult result = geminiChatService.generateResponse(promptMessages);

        // 4. Save assistant response
        Message assistantMsg = new Message(conversation, MessageRole.ASSISTANT, result.content(), MessageType.TEXT);
        assistantMsg.setModel(result.model());
        assistantMsg.setInputTokens(result.inputTokens());
        assistantMsg.setOutputTokens(result.outputTokens());
        assistantMsg.setTotalTokens(result.totalTokens());
        assistantMsg = messageRepository.save(assistantMsg);

        // 5. Update conversation timestamp
        conversationService.touchConversation(conversationId);

        // 6. Record usage asynchronously
        usageService.recordUsage(conversation.getUser(), conversationId, result.model(), "CHAT", result.inputTokens(), result.outputTokens());

        // 7. Background Intelligence: Title generation, Memory extraction, Summarization
        long count = messageRepository.countByConversation(conversation);
        if (count <= 2) {
            titleService.generateTitleIfDefaultAsync(conversationId, request.message());
        }
        memoryService.extractAndSaveMemoriesAsync(userId, request.message(), result.content());
        summaryService.checkAndSummarizeAsync(conversation);

        return ChatMessageResponse.from(assistantMsg);
    }

    public SseEmitter streamMessage(String userId, String conversationId, ChatMessageRequest request) {
        Conversation conversation = conversationService.getValidatedConversation(userId, conversationId);

        // Save user message in initial transaction
        Message userMsg = new Message(conversation, MessageRole.USER, request.message().trim(), MessageType.TEXT);
        userMsg = messageRepository.save(userMsg);

        // Build context
        List<org.springframework.ai.chat.messages.Message> promptMessages =
                contextService.buildPromptMessages(conversation, userMsg.getContent());

        SseEmitter emitter = new SseEmitter(120000L); // 120s timeout
        AtomicBoolean completed = new AtomicBoolean(false);
        AtomicReference<Disposable> disposableRef = new AtomicReference<>();

        Runnable cleanup = () -> {
            if (completed.compareAndSet(false, true)) {
                Disposable d = disposableRef.get();
                if (d != null && !d.isDisposed()) {
                    d.dispose();
                }
            }
        };

        emitter.onTimeout(() -> {
            log.warn("SSE connection timed out for conversation {}", conversationId);
            cleanup.run();
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        });

        emitter.onError(ex -> {
            log.debug("SSE connection closed or error for conversation {}: {}", conversationId, ex.getMessage());
            cleanup.run();
        });

        emitter.onCompletion(cleanup::run);

        StringBuilder accumulatedContent = new StringBuilder();

        Flux<ChatResponse> responseFlux = geminiChatService.streamResponse(promptMessages);

        Disposable subscription = responseFlux.subscribe(
                chatResponse -> {
                    if (completed.get()) {
                        return;
                    }
                    if (chatResponse != null && chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null) {
                        String text = chatResponse.getResult().getOutput().getText();
                        if (text != null && !text.isEmpty()) {
                            accumulatedContent.append(text);
                            try {
                                emitter.send(SseEmitter.event().data(StreamChunkEvent.content(text)));
                            } catch (Exception e) {
                                log.debug("Client disconnected during SSE streaming: {}", e.getMessage());
                                cleanup.run();
                            }
                        }
                    }
                },
                error -> {
                    if (completed.compareAndSet(false, true)) {
                        log.error("Streaming error for conversation {}: {}", conversationId, error.getMessage(), error);
                        try {
                            emitter.send(SseEmitter.event().data(StreamChunkEvent.error(error.getMessage())));
                        } catch (Exception ignored) {
                        } finally {
                            try {
                                emitter.complete();
                            } catch (Exception ignored) {}
                        }
                    }
                },
                () -> {
                    if (completed.compareAndSet(false, true)) {
                        String finalContent = accumulatedContent.toString();
                        Message assistantMsg = new Message(conversation, MessageRole.ASSISTANT, finalContent, MessageType.TEXT);
                        String activeModel = (geminiProperties != null && geminiProperties.gemini() != null && geminiProperties.gemini().chatModel() != null)
                                ? geminiProperties.gemini().chatModel()
                                : "gemini-3.6-flash";
                        assistantMsg.setModel(activeModel);
                        assistantMsg = messageRepository.save(assistantMsg);

                        conversationService.touchConversation(conversationId);

                        long count = messageRepository.countByConversation(conversation);
                        if (count <= 2) {
                            titleService.generateTitleIfDefaultAsync(conversationId, request.message());
                        }
                        memoryService.extractAndSaveMemoriesAsync(userId, request.message(), finalContent);
                        summaryService.checkAndSummarizeAsync(conversation);

                        try {
                            emitter.send(SseEmitter.event().data(StreamChunkEvent.complete(assistantMsg.getId())));
                            emitter.complete();
                        } catch (Exception ignored) {}
                    }
                }
        );

        disposableRef.set(subscription);
        return emitter;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ChatMessageResponse> getMessages(String userId, String conversationId, int page, int size) {
        Conversation conversation = conversationService.getValidatedConversation(userId, conversationId);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<Message> messagePage = messageRepository.findByConversationOrderByCreatedAtAsc(conversation, pageable);
        return PagedResponse.from(messagePage.map(ChatMessageResponse::from));
    }
}
