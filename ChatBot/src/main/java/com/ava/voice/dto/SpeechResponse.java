package com.ava.voice.dto;

public record SpeechResponse(
        String text,
        String audioFormat,
        byte[] audioData
) {}
