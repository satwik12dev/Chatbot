package com.ava.voice.controller;

import com.ava.common.response.ApiResponse;
import com.ava.common.util.SecurityUtils;
import com.ava.voice.dto.SpeechResponse;
import com.ava.voice.dto.TranscriptionResponse;
import com.ava.voice.dto.VoiceChatResponse;
import com.ava.voice.service.VoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/voice")
@Tag(name = "Voice", description = "Endpoints for Gemini-powered voice chat, transcription, and speech synthesis")
public class VoiceController {

    private final VoiceService voiceService;

    public VoiceController(VoiceService voiceService) {
        this.voiceService = voiceService;
    }

    @PostMapping(value = "/chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Send an audio message and receive both transcribed text and spoken audio response from AVA")
    public ResponseEntity<ApiResponse<VoiceChatResponse>> voiceChat(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "conversationId", required = false) String conversationId) {
        String userId = SecurityUtils.getCurrentUserId();
        VoiceChatResponse response = voiceService.voiceChat(userId, conversationId, audioFile);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Transcribe user audio to text using Gemini multimodal understanding")
    public ResponseEntity<ApiResponse<TranscriptionResponse>> transcribe(
            @RequestParam("audio") MultipartFile audioFile) {
        TranscriptionResponse response = voiceService.transcribe(audioFile);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/synthesize")
    @Operation(summary = "Synthesize assistant text to speech audio WAV stream")
    public ResponseEntity<byte[]> synthesize(@RequestBody Map<String, String> request) {
        String text = request.getOrDefault("text", "");
        SpeechResponse speech = voiceService.synthesize(text);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "audio/wav")
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ava-speech.wav\"")
                .body(speech.audioData());
    }
}
