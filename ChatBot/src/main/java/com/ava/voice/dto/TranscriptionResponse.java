package com.ava.voice.dto;

public record TranscriptionResponse(
        String transcribedText,
        String audioFormat,
        long durationMs
) {}
