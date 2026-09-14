"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "@/components/ui/Avatar";
import { CodeBlock } from "./CodeBlock";
import { AudioPlayer } from "./AudioPlayer";
import { voiceApi } from "@/api/voiceApi";
import {
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  Loader2,
} from "lucide-react";
import { ChatMessageResponse } from "@/types/api";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface AssistantMessageProps {
  message: ChatMessageResponse;
  onRegenerate?: () => void;
  showTimestamp?: boolean;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onRegenerate,
  showTimestamp = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSynthesizeAudio = async () => {
    if (audioUrl) {
      // already synthesized, reset
      setAudioUrl(null);
      return;
    }

    setIsSynthesizing(true);
    try {
      const audioBlob = await voiceApi.synthesize(message.content);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err: any) {
      toast.error(err.message || "Failed to synthesize speech.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="group relative flex gap-3.5 py-4 text-sm text-zinc-200">
      {/* AVA Avatar */}
      <Avatar type="assistant" size="md" className="mt-0.5" />

      <div className="min-w-0 flex-1 space-y-2">
        {/* Header with name and model */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-white">AVA</span>
          {message.model && (
            <span className="rounded-md bg-[#121218] border border-white/[0.08] px-2 py-0.5 text-[10px] text-zinc-300 font-mono">
              {message.model}
            </span>
          )}
          {showTimestamp && (
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatRelativeTime(message.createdAt)}
            </span>
          )}
        </div>

        {/* Message Content with Markdown */}
        <div className="prose prose-invert max-w-none break-words leading-relaxed text-zinc-200 text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              p({ children }) {
                return (
                  <p className="my-3 leading-relaxed text-zinc-200 text-sm break-words animate-line-reveal">
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
              table({ children }) {
                return (
                  <div className="my-5 overflow-x-auto rounded-2xl border border-white/[0.1] bg-[#09090e] shadow-xl animate-line-reveal">
                    <table className="w-full text-left text-xs border-collapse">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="border-b border-white/[0.08] bg-[#121218] px-4 py-2.5 font-bold text-white">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="border-b border-white/[0.04] px-4 py-2.5 text-zinc-200">
                    {children}
                  </td>
                );
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-indigo-500 pl-4 py-1.5 italic text-zinc-300 my-3.5 bg-indigo-500/[0.04] rounded-r-xl animate-line-reveal">
                    {children}
                  </blockquote>
                );
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 font-medium underline decoration-indigo-500/50 underline-offset-2 hover:text-indigo-300 transition-colors"
                  >
                    {children}
                  </a>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 space-y-1.5 my-3 animate-line-reveal">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 space-y-1.5 my-3 animate-line-reveal">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed text-zinc-200 marker:text-indigo-400 pl-0.5">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-extrabold text-white mt-6 mb-3 tracking-tight border-b border-white/[0.08] pb-2 animate-line-reveal">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold text-white mt-5 mb-2.5 tracking-tight animate-line-reveal">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-sm font-bold text-indigo-300 mt-4 mb-2 tracking-tight animate-line-reveal">{children}</h3>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Audio Player if synthesized */}
        {audioUrl && (
          <div className="mt-3">
            <AudioPlayer src={audioUrl} autoPlay={true} />
          </div>
        )}

        {/* Actions Toolbar */}
        <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            title="Copy message"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
              title="Regenerate response"
              aria-label="Regenerate response"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Voice synthesis button */}
          <button
            onClick={handleSynthesizeAudio}
            disabled={isSynthesizing}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            title="Listen to response"
            aria-label="Listen to response"
          >
            {isSynthesizing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Like / Dislike */}
          <button
            onClick={() => setLiked(liked === true ? null : true)}
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              liked === true
                ? "text-indigo-400 bg-indigo-500/15"
                : "text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            }`}
            title="Good response"
            aria-label="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setLiked(liked === false ? null : false)}
            className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
              liked === false
                ? "text-red-400 bg-red-500/15"
                : "text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            }`}
            title="Bad response"
            aria-label="Bad response"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
