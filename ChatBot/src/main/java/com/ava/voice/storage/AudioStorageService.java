package com.ava.voice.storage;

import com.ava.common.exception.InvalidAudioException;
import com.ava.config.GeminiProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
public class AudioStorageService {

    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
            "audio/wav", "audio/x-wav", "audio/wave",
            "audio/mp3", "audio/mpeg",
            "audio/ogg", "audio/webm",
            "audio/aac", "audio/m4a", "audio/x-m4a"
    );

    private final GeminiProperties geminiProperties;

    public AudioStorageService(GeminiProperties geminiProperties) {
        this.geminiProperties = geminiProperties;
    }

    public byte[] validateAndReadAudioBytes(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAudioException("Audio file is empty or missing");
        }

        long maxBytes = (long) geminiProperties.limits().maxAudioSizeMb() * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new InvalidAudioException("Audio file size exceeds maximum allowed limit of " + geminiProperties.limits().maxAudioSizeMb() + "MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AUDIO_TYPES.contains(contentType.toLowerCase())) {
            // Also check file extension as fallback
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.endsWith(".wav") && !filename.endsWith(".mp3") && !filename.endsWith(".ogg") && !filename.endsWith(".webm") && !filename.endsWith(".m4a"))) {
                throw new InvalidAudioException("Unsupported audio format: " + contentType + ". Supported formats: WAV, MP3, OGG, WEBM, AAC, M4A");
            }
        }

        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new InvalidAudioException("Failed to read audio file bytes: " + e.getMessage());
        }
    }

    public String resolveMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && ALLOWED_AUDIO_TYPES.contains(contentType.toLowerCase())) {
            return contentType.toLowerCase();
        }
        String filename = file.getOriginalFilename();
        if (filename != null && filename.endsWith(".wav")) return "audio/wav";
        if (filename != null && (filename.endsWith(".mp3") || filename.endsWith(".mpeg"))) return "audio/mp3";
        if (filename != null && filename.endsWith(".ogg")) return "audio/ogg";
        if (filename != null && filename.endsWith(".webm")) return "audio/webm";
        if (filename != null && (filename.endsWith(".m4a") || filename.endsWith(".aac"))) return "audio/m4a";
        return "audio/wav";
    }
}
