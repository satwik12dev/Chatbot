"use client";

import React, { useEffect, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { WelcomeScreen } from "./WelcomeScreen";
import { Composer } from "./Composer";
import { useChatStore } from "@/store/chatStore";
import { useConversationStore } from "@/store/conversationStore";
import { useStreamMessage } from "@/hooks/useStreamMessage";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ChatContainerProps {
  conversationId?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ conversationId }) => {
  const router = useRouter();
  const {
    messages,
    isLoadingMessages,
    isStreaming,
    isThinking,
    streamingContent,
    loadMessages,
    clearMessages,
  } = useChatStore();

  const {
    activeConversation,
    fetchConversation,
    createConversation,
    isCreating,
  } = useConversationStore();

  const { sendMessage, stopGeneration } = useStreamMessage();

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
      loadMessages(conversationId);
    } else {
      clearMessages();
    }
  }, [conversationId, fetchConversation, loadMessages, clearMessages]);

  const handleSendMessage = async (text: string) => {
    if (conversationId) {
      sendMessage(conversationId, text);
    } else {
      // First message in a new session: create conversation first, then redirect and send
      try {
        const newConv = await createConversation();
        router.push(`/chat/${newConv.id}`);
        // Small delay to allow state to settle, or send directly
        setTimeout(() => {
          sendMessage(newConv.id, text);
        }, 100);
      } catch {
        // error handled in store
      }
    }
  };

  const handleResendMessage = (content: string) => {
    if (conversationId) {
      sendMessage(conversationId, content);
    }
  };

  const handleRegenerateResponse = () => {
    if (!conversationId || messages.length === 0) return;
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "USER");
    if (lastUserMessage) {
      sendMessage(conversationId, lastUserMessage.content);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-black">
      {conversationId && <ChatHeader conversation={activeConversation} />}

      {/* Main viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {isLoadingMessages ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Loading messages...</span>
            </div>
          </div>
        ) : conversationId && messages.length > 0 ? (
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            isThinking={isThinking}
            streamingContent={streamingContent}
            onResendMessage={handleResendMessage}
            onRegenerateResponse={handleRegenerateResponse}
          />
        ) : (
          <WelcomeScreen onSelectPrompt={handleSendMessage} />
        )}

        {/* Floating Composer */}
        <Composer
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={stopGeneration}
          disabled={isCreating}
        />
      </div>
    </div>
  );
};
