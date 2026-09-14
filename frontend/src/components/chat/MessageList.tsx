"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";
import { CodeBlock } from "./CodeBlock";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { Avatar } from "@/components/ui/Avatar";
import { ChatMessageResponse } from "@/types/api";
import { Sparkles } from "lucide-react";

interface MessageListProps {
  messages: ChatMessageResponse[];
  isStreaming: boolean;
  isThinking: boolean;
  streamingContent: string;
  onResendMessage?: (content: string) => void;
  onRegenerateResponse?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  isThinking,
  streamingContent,
  onResendMessage,
  onRegenerateResponse,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isUserNearBottomRef = useRef(true);

  // Check if user is scrolled to bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 120;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    isUserNearBottomRef.current = isNearBottom;
    setShowScrollBottom(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  // Follow stream if user is near bottom
  useEffect(() => {
    if (isUserNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, streamingContent, isThinking, scrollToBottom]);

  return (
    <div className="relative flex-1 overflow-hidden bg-black">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto max-w-3xl space-y-3">
          {messages.map((message, index) => {
            const isLastAssistant =
              message.role === "ASSISTANT" &&
              index === messages.length - 1 &&
              !isStreaming;

            if (message.role === "USER") {
              return (
                <UserMessage
                  key={message.id}
                  message={message}
                  onResend={onResendMessage}
                />
              );
            }

            return (
              <AssistantMessage
                key={message.id}
                message={message}
                onRegenerate={isLastAssistant ? onRegenerateResponse : undefined}
              />
            );
          })}

          {/* Active Streaming or Thinking state */}
          {isStreaming && (
            <div className="group relative flex gap-3.5 py-4 text-sm text-zinc-200 animate-in fade-in duration-200">
              <Avatar type="assistant" size="md" className="mt-0.5" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">AVA</span>
                  <span className="rounded-md bg-[#121218] border border-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-300 font-mono">
                    gemini-2.5-flash
                  </span>
                </div>

                {isThinking && !streamingContent && (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                    <Sparkles className="h-4 w-4 animate-spin text-indigo-400" />
                    <span className="font-medium text-zinc-300">AVA is synthesizing response</span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 thinking-dot-1" />
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 thinking-dot-2" />
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 thinking-dot-3" />
                    </div>
                  </div>
                )}

                {streamingContent && (
                  <div className="prose prose-invert max-w-none break-words leading-relaxed text-zinc-200 text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre({ children }) {
                          return <>{children}</>;
                        },
                        p({ children }) {
                          return (
                            <p className="my-2.5 leading-relaxed text-zinc-200 text-sm break-words animate-line-reveal">
                              {children}
                            </p>
                          );
                        },
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match && !String(children).includes("\n");

                          if (isInline) {
                            return (
                              <code
                                className="inline-flex items-center rounded-lg bg-[#14141e] px-2 py-0.5 text-xs text-indigo-300 font-mono border border-indigo-500/25 font-semibold mx-1 shadow-xs align-middle"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          }

                          return (
                            <CodeBlock
                              language={match ? match[1] : ""}
                              value={String(children).replace(/\n$/, "")}
                            />
                          );
                        },
                        ul({ children }) {
                          return <ul className="list-disc pl-5 space-y-1.5 my-2.5 animate-line-reveal">{children}</ul>;
                        },
                        ol({ children }) {
                          return <ol className="list-decimal pl-5 space-y-1.5 my-2.5 animate-line-reveal">{children}</ol>;
                        },
                        li({ children }) {
                          return <li className="leading-relaxed text-zinc-200 marker:text-indigo-400 pl-0.5">{children}</li>;
                        },
                      }}
                    >
                      {streamingContent}
                    </ReactMarkdown>
                    <span className="inline-block h-3.5 w-1.5 ml-1 align-middle bg-indigo-400 animate-pulse rounded-xs shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Floating Scroll to Bottom Indicator */}
      <ScrollToBottomButton
        visible={showScrollBottom}
        onClick={() => scrollToBottom(true)}
      />
    </div>
  );
};
