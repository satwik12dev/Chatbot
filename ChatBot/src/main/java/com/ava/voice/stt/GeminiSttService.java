package com.ava.voice.stt;

import com.ava.common.exception.GeminiServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.content.Media;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

@Service
public class GeminiSttService {

    private static final Logger log = LoggerFactory.getLogger(GeminiSttService.class);

    private final ChatClient chatClient;

    public GeminiSttService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public String transcribeAudio(byte[] audioBytes, String mimeType) {
        try {
            Media audioMedia = new Media(MimeTypeUtils.parseMimeType(mimeType), new ByteArrayResource(audioBytes));

            String transcriptionPrompt = """
                    Listen carefully to this audio recording.
                    Transcribe all spoken words into accurate text.
                    Rules:
                    - Output ONLY the verbatim spoken text.
                    - Do not add preface, markdown quotes, notes, or timestamps.
                    - If no speech is intelligible, return an empty string.
                    """;

            String result = chatClient.prompt()
                    .system("You are an expert audio transcription system. Return only the transcribed text verbatim.")
                    .user(u -> u.text(transcriptionPrompt).media(audioMedia))
                    .call()
                    .content();

            return result != null ? result.trim() : "";
        } catch (Exception ex) {
            log.error("Gemini speech transcription failed: {}", ex.getMessage(), ex);
            throw new GeminiServiceException("Failed to transcribe audio via Gemini: " + ex.getMessage(), ex);
        }
    }
}
