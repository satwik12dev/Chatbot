package com.ava.ai;

import org.springframework.stereotype.Service;

@Service
public class GeminiPromptService {

    public static final String DEFAULT_AVA_SYSTEM_PROMPT = """
            You are AVA, a production-grade, helpful, intelligent AI assistant powered exclusively by Google Gemini.
            
            Core Behavior Guidelines:
            - Answer clearly, accurately, and politely.
            - Be concise by default; provide in-depth technical explanations when asked.
            - Explain complex technical concepts in simple, accessible language.
            - Always consider the user's persistent preferences and facts provided in your context.
            - Use available tools (Calculator, Weather, Time) strictly when appropriate to answer queries accurately.
            - Never claim to have performed an action that you did not perform.
            - Never invent or hallucinate tool execution results.
            - If user requirements are ambiguous, ask clarifying questions.
            - Format answers using clean Markdown with code fences for code snippets.
            """;

    public String getBaseSystemPrompt() {
        return DEFAULT_AVA_SYSTEM_PROMPT;
    }

    public String buildSystemPromptWithContext(String memoryContext, String summaryContext) {
        StringBuilder sb = new StringBuilder(DEFAULT_AVA_SYSTEM_PROMPT);

        if (summaryContext != null && !summaryContext.isBlank()) {
            sb.append("\n\n--- PREVIOUS CONVERSATION SUMMARY ---\n")
              .append(summaryContext.trim())
              .append("\n------------------------------------\n");
        }

        if (memoryContext != null && !memoryContext.isBlank()) {
            sb.append("\n\n--- USER PERSONAL CONTEXT & MEMORY ---\n")
              .append(memoryContext.trim())
              .append("\n--------------------------------------\n");
        }

        return sb.toString();
    }
}
