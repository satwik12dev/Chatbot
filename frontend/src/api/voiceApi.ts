import { apiClient, tokenStorage } from "./client";
import {
  ApiResponse,
  VoiceChatResponse,
  TranscriptionResponse,
} from "@/types/api";

export const voiceApi = {
  voiceChat: (audioBlob: Blob, conversationId?: string, filename = "audio.wav") => {
    const formData = new FormData();
    formData.append("audio", audioBlob, filename);
    if (conversationId) {
      formData.append("conversationId", conversationId);
    }
    return apiClient.postMultipart<ApiResponse<VoiceChatResponse>>("/voice/chat", formData);
  },

  transcribe: (audioBlob: Blob, filename = "audio.wav") => {
    const formData = new FormData();
    formData.append("audio", audioBlob, filename);
    return apiClient.postMultipart<ApiResponse<TranscriptionResponse>>("/voice/transcribe", formData);
  },

  synthesize: async (text: string): Promise<Blob> => {
    const baseUrl = apiClient.getBaseUrl();
    const token = tokenStorage.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/voice/synthesize`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Speech synthesis failed with status ${response.status}`);
    }

    return await response.blob();
  },
};
