import { create } from "zustand";
import { ChatMessageResponse } from "@/types/api";
import { messageApi } from "@/api/messageApi";

interface ChatState {
  messages: ChatMessageResponse[];
  isLoadingMessages: boolean;
  isStreaming: boolean;
  isThinking: boolean;
  streamingContent: string;
  streamingMessageId: string | null;
  abortController: AbortController | null;
  activeAudioUrl: string | null;
  error: string | null;

  loadMessages: (conversationId: string) => Promise<void>;
  addOptimisticUserMessage: (conversationId: string, content: string) => string;
  setThinking: (isThinking: boolean) => void;
  appendStreamingChunk: (chunk: string) => void;
  finishStreaming: (savedMessageId?: string, conversationId?: string) => void;
  setAbortController: (controller: AbortController | null) => void;
  stopStreaming: () => void;
  setActiveAudioUrl: (url: string | null) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
  replaceMessage: (tempId: string, actualMessage: ChatMessageResponse) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoadingMessages: false,
  isStreaming: false,
  isThinking: false,
  streamingContent: "",
  streamingMessageId: null,
  abortController: null,
  activeAudioUrl: null,
  error: null,

  loadMessages: async (conversationId: string) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const res = await messageApi.getMessages(conversationId, { page: 0, size: 100 });
      // Spring Boot returns page content, ensure ascending order (older first, newer last)
      const msgs = res.data?.content || [];
      const sorted = [...msgs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      set({ messages: sorted, isLoadingMessages: false });
    } catch (err: any) {
      set({ error: err.message, isLoadingMessages: false });
    }
  },

  addOptimisticUserMessage: (conversationId: string, content: string) => {
    const tempId = `temp-user-${Date.now()}`;
    const userMsg: ChatMessageResponse = {
      id: tempId,
      conversationId,
      role: "USER",
      content,
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, userMsg],
      streamingContent: "",
      isThinking: true,
      isStreaming: true,
      error: null,
    }));
    return tempId;
  },

  setThinking: (isThinking: boolean) => set({ isThinking }),

  appendStreamingChunk: (chunk: string) => {
    set((state) => ({
      isThinking: false,
      isStreaming: true,
      streamingContent: state.streamingContent + chunk,
    }));
  },

  finishStreaming: (savedMessageId?: string, conversationId?: string) => {
    const { streamingContent, messages } = get();
    if (streamingContent.trim()) {
      const assistantMsg: ChatMessageResponse = {
        id: savedMessageId || `msg-${Date.now()}`,
        conversationId: conversationId || (messages[0]?.conversationId ?? ""),
        role: "ASSISTANT",
        content: streamingContent,
        messageType: "TEXT",
        model: "gemini-2.5-flash",
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMsg],
        streamingContent: "",
        isStreaming: false,
        isThinking: false,
        abortController: null,
      }));
    } else {
      set({
        streamingContent: "",
        isStreaming: false,
        isThinking: false,
        abortController: null,
      });
    }
  },

  setAbortController: (controller: AbortController | null) => {
    set({ abortController: controller });
  },

  stopStreaming: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    // Finalize any text received so far
    get().finishStreaming();
  },

  setActiveAudioUrl: (url) => set({ activeAudioUrl: url }),

  clearMessages: () =>
    set({
      messages: [],
      streamingContent: "",
      isStreaming: false,
      isThinking: false,
      error: null,
    }),

  setError: (error) => set({ error, isStreaming: false, isThinking: false }),

  replaceMessage: (tempId, actual) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === tempId ? actual : m)),
    })),
}));
