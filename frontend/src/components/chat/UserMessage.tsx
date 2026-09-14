"use client";

import React, { useState } from "react";
import { Copy, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChatMessageResponse } from "@/types/api";
import { formatRelativeTime } from "@/lib/utils";

interface UserMessageProps {
  message: ChatMessageResponse;
  onResend?: (content: string) => void;
  showTimestamp?: boolean;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  onResend,
  showTimestamp = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSaveAndResend = () => {
    if (!editText.trim()) return;
    setIsEditing(false);
    if (onResend) {
      onResend(editText.trim());
    }
  };

  return (
    <div className="group relative flex flex-col items-end py-3">
      {isEditing ? (
        <div className="w-full max-w-2xl rounded-2xl border border-white/[0.14] bg-[#101016] p-4 shadow-2xl backdrop-blur-xl">
          <textarea
            autoFocus
            rows={4}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full resize-none bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/[0.08] pt-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditText(message.content);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveAndResend}>
              Save & Resend
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-end max-w-2xl">
          <div className="rounded-2xl bg-[#121218] px-4.5 py-3 text-sm text-zinc-100 shadow-md border border-white/[0.08] hover:border-white/[0.14] transition-all selection:bg-indigo-500/30 whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </div>

          {/* Action Bar (hover on desktop, subtle on mobile) */}
          <div className="mt-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1">
            {showTimestamp && (
              <span className="text-[10px] text-zinc-400 font-mono">
                {formatRelativeTime(message.createdAt)}
              </span>
            )}

            <button
              onClick={handleCopy}
              className="rounded-md p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>

            {onResend && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-md p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Edit message"
                aria-label="Edit message"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
