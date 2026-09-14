import { apiClient, tokenStorage, ApiError } from "./client";
import {
  ApiResponse,
  PagedResponse,
  ChatMessageResponse,
  ChatMessageRequest,
  StreamChunkEvent,
} from "@/types/api";

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (messageId: string) => void;
  onError: (error: string) => void;
}

export const messageApi = {
  sendMessage: (conversationId: string, data: ChatMessageRequest) =>
    apiClient.post<ApiResponse<ChatMessageResponse>>(
      `/conversations/${conversationId}/messages`,
      data
    ),

  getMessages: (
    conversationId: string,
    params?: { page?: number; size?: number }
  ) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));
    const qs = query.toString();
    return apiClient.get<ApiResponse<PagedResponse<ChatMessageResponse>>>(
      `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`
    );
  },

  streamMessage: async (
    conversationId: string,
    data: ChatMessageRequest,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ) => {
    const baseUrl = apiClient.getBaseUrl();
    const token = tokenStorage.getAccessToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(
        `${baseUrl}/conversations/${conversationId}/messages/stream`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          signal,
        }
      );

      if (!response.ok) {
        let errorMsg = `Streaming failed with status: ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson?.message) errorMsg = errJson.message;
        } catch {
          // ignore parsing error
        }
        callbacks.onError(errorMsg);
        return;
      }

      if (!response.body) {
        callbacks.onError("No response stream received from server.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last partial line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue; // skip empty or heartbeat comments

          if (trimmed.startsWith("data:")) {
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const event: StreamChunkEvent = JSON.parse(jsonStr);
              if (event.type === "content" && event.text) {
                callbacks.onChunk(event.text);
              } else if (event.type === "complete") {
                callbacks.onComplete(event.messageId || "");
              } else if (event.type === "error") {
                callbacks.onError(event.error || "An error occurred during streaming.");
              }
            } catch (err) {
              // Sometimes SSE transmits raw text chunk if not JSON
              callbacks.onChunk(jsonStr);
            }
          }
        }
      }

      // Check any remaining buffer
      if (buffer.trim().startsWith("data:")) {
        const jsonStr = buffer.trim().slice(5).trim();
        try {
          const event: StreamChunkEvent = JSON.parse(jsonStr);
          if (event.type === "content" && event.text) callbacks.onChunk(event.text);
          if (event.type === "complete") callbacks.onComplete(event.messageId || "");
          if (event.type === "error") callbacks.onError(event.error || "Error");
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // Stream deliberately aborted by user via Stop Generating
        return;
      }
      callbacks.onError(err.message || "Failed to establish streaming connection.");
    }
  },
};
