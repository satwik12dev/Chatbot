import { useCallback, useRef } from "react";
import { messageApi } from "@/api/messageApi";
import { useChatStore } from "@/store/chatStore";
import { useConversationStore } from "@/store/conversationStore";
import { useSettingsStore } from "@/store/settingsStore";
import { toast } from "sonner";

export function useStreamMessage() {
  const {
    addOptimisticUserMessage,
    appendStreamingChunk,
    finishStreaming,
    setAbortController,
    setError,
  } = useChatStore();

  const { fetchConversations } = useConversationStore();
  const { streamResponses } = useSettingsStore();
  const activeControllerRef = useRef<AbortController | null>(null);

  // Smooth typing buffer queue state
  const bufferQueueRef = useRef<string>("");
  const tickerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCompleteIdRef = useRef<string | null>(null);
  const activeConvIdRef = useRef<string>("");

  const clearTicker = useCallback(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    bufferQueueRef.current = "";
    pendingCompleteIdRef.current = null;
  }, []);

  // Smooth ticker that drains buffer smoothly line by line / token by token
  const startDrainTicker = useCallback(
    (convId: string) => {
      if (tickerRef.current) return;

      tickerRef.current = setInterval(() => {
        const queueLen = bufferQueueRef.current.length;

        if (queueLen > 0) {
          // Dynamic adaptive typing speed:
          // If queue is small: 1-2 chars per tick for elegant typewriter feel (~60 chars/sec)
          // If queue is large (big code block/chunk): 6-12 chars per tick so user never waits too long
          const batch = queueLen > 300 ? 18 : queueLen > 120 ? 8 : queueLen > 40 ? 3 : 1;
          const chunkToEmit = bufferQueueRef.current.slice(0, batch);
          bufferQueueRef.current = bufferQueueRef.current.slice(batch);
          appendStreamingChunk(chunkToEmit);
        } else if (pendingCompleteIdRef.current !== null) {
          // Buffer is fully drained and completion signal received
          const savedId = pendingCompleteIdRef.current;
          clearTicker();
          finishStreaming(savedId, convId);
          activeControllerRef.current = null;
          fetchConversations();
        }
      }, 16);
    },
    [appendStreamingChunk, finishStreaming, fetchConversations, clearTicker]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !conversationId) return;

      activeConvIdRef.current = conversationId;
      clearTicker();

      // Add optimistic user message to the UI
      addOptimisticUserMessage(conversationId, trimmed);

      // If user disabled streaming in settings, use smooth typewriter reveal on REST response
      if (!streamResponses) {
        try {
          const res = await messageApi.sendMessage(conversationId, { message: trimmed });
          if (res.data) {
            const assistantContent = res.data.content;
            const assistantId = res.data.id;
            // Smoothly reveal the response line by line rather than popping all at once
            bufferQueueRef.current = assistantContent;
            pendingCompleteIdRef.current = assistantId;
            startDrainTicker(conversationId);
          }
        } catch (err: any) {
          setError(err.message || "Failed to send message.");
          toast.error(err.message || "Failed to send message.");
        }
        return;
      }

      // Create abort controller for streaming cancellation
      const controller = new AbortController();
      activeControllerRef.current = controller;
      setAbortController(controller);

      // Start the smooth typing release ticker
      startDrainTicker(conversationId);

      try {
        await messageApi.streamMessage(
          conversationId,
          { message: trimmed },
          {
            onChunk: (chunk: string) => {
              // Push into smooth progressive buffer queue
              bufferQueueRef.current += chunk;
            },
            onComplete: (savedMessageId: string) => {
              // Flag completion; ticker will finalize as soon as buffer drains
              pendingCompleteIdRef.current = savedMessageId;
            },
            onError: (errorMessage: string) => {
              clearTicker();
              setError(errorMessage);
              toast.error(errorMessage);
              activeControllerRef.current = null;
            },
          },
          controller.signal
        );
      } catch (err: any) {
        if (err.name !== "AbortError") {
          clearTicker();
          setError(err.message || "Stream connection failed.");
          toast.error(err.message || "Stream connection failed.");
        }
        activeControllerRef.current = null;
      }
    },
    [
      addOptimisticUserMessage,
      setAbortController,
      setError,
      streamResponses,
      clearTicker,
      startDrainTicker,
    ]
  );

  const stopGeneration = useCallback(() => {
    clearTicker();
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }
    useChatStore.getState().stopStreaming();
  }, [clearTicker]);

  return {
    sendMessage,
    stopGeneration,
  };
}
