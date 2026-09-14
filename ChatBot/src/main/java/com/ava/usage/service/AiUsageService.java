package com.ava.usage.service;

import com.ava.usage.entity.AiUsage;
import com.ava.usage.repository.AiUsageRepository;
import com.ava.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiUsageService {

    private static final Logger log = LoggerFactory.getLogger(AiUsageService.class);

    private final AiUsageRepository aiUsageRepository;

    public AiUsageService(AiUsageRepository aiUsageRepository) {
        this.aiUsageRepository = aiUsageRepository;
    }

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordUsage(User user, String conversationId, String model, String requestType, int inputTokens, int outputTokens) {
        try {
            AiUsage usage = new AiUsage(user, conversationId, model, requestType, inputTokens, outputTokens);
            aiUsageRepository.save(usage);
            log.debug("Recorded AI usage: userId={}, tokens={}", user.getId(), inputTokens + outputTokens);
        } catch (Exception ex) {
            log.error("Failed to record AI usage: {}", ex.getMessage());
        }
    }
}
