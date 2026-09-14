"use client";

import React, { useState } from "react";
import { Edit2, Check, X, Archive, Trash2, Sparkles } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ConversationResponse } from "@/types/api";
import { useConversationStore } from "@/store/conversationStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: ConversationResponse | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation?.title || "New Chat");
  const [isDeleting, setIsDeleting] = useState(false);

  const { updateConversation, deleteConversation } = useConversationStore();
  const router = useRouter();

  if (!conversation) return null;

  const handleSaveTitle = async () => {
    if (!title.trim() || title === conversation.title) {
      setIsEditing(false);
      return;
    }
    try {
      await updateConversation(conversation.id, { title: title.trim() });
      toast.success("Title updated");
    } catch {
      toast.error("Failed to update title");
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleArchive = async () => {
    try {
      await updateConversation(conversation.id, { archived: !conversation.archived });
      toast.success(
        conversation.archived ? "Conversation unarchived" : "Conversation archived"
      );
    } catch {
      toast.error("Failed to archive conversation");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConversation(conversation.id);
      toast.success("Conversation deleted");
      router.push("/chat");
    } catch {
      toast.error("Failed to delete conversation");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex h-13 items-center justify-between border-b border-white/[0.08] bg-black/60 px-4 backdrop-blur-xl shrink-0 select-none z-10">
        {/* Title area */}
        <div className="flex min-w-0 items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                className="rounded-lg border border-indigo-500 bg-[#0c0c12] px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveTitle}
                className="rounded p-1 text-zinc-400 hover:text-emerald-400 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-white tracking-tight">
                {conversation.title || "New Chat"}
              </h2>
              <button
                onClick={() => {
                  setTitle(conversation.title || "");
                  setIsEditing(true);
                }}
                className="rounded p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Rename conversation"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Model info & header actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#0e0e14] px-3 py-1 text-[11px] text-zinc-300 font-medium shadow-xs">
            <Sparkles className="h-3 w-3 text-indigo-400 drop-shadow-xs" />
            <span>Gemini 2.5 Flash</span>
          </div>

          <button
            onClick={handleToggleArchive}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer"
            title={conversation.archived ? "Unarchive" : "Archive"}
          >
            <Archive className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsDeleting(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="Delete conversation?"
        description="This will permanently delete this conversation and all messages."
        confirmLabel="Delete"
      />
    </>
  );
};
