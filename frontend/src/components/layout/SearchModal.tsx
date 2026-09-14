"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Search, MessageSquare, Loader2, Calendar } from "lucide-react";
import { searchApi } from "@/api/searchApi";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchResponse } from "@/types/api";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const res = await searchApi.searchConversations(debouncedQuery.trim(), 10);
        if (isMounted) {
          setResults(res.data);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  const handleSelectConversation = (conversationId: string) => {
    onClose();
    router.push(`/chat/${conversationId}`);
  };

  const hasConversations = (results?.matchedConversations?.length ?? 0) > 0;
  const hasMessages = (results?.matchedMessages?.length ?? 0) > 0;
  const hasResults = hasConversations || hasMessages;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className="p-0 max-w-xl overflow-hidden bg-[#09090d]/95 border-white/[0.1] shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center border-b border-white/[0.08] px-4 py-3.5 bg-black/40">
        <Search className="h-4 w-4 text-indigo-400 mr-3 shrink-0" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations and messages..."
          className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-400 ml-2" />}
        <kbd className="hidden sm:inline-flex ml-2 rounded border border-white/[0.1] bg-[#16161f] px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
          ESC
        </kbd>
      </div>

      <div className="max-h-96 overflow-y-auto p-2.5">
        {query.trim() && !isLoading && !hasResults && (
          <div className="p-8 text-center">
            <p className="text-sm font-semibold text-zinc-300">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-zinc-400 mt-1">Try searching with a different keyword</p>
          </div>
        )}

        {!query.trim() && (
          <div className="p-6 text-center text-xs text-zinc-400">
            Type a topic, question, or keyword to search through your past chats.
          </div>
        )}

        {hasConversations && (
          <div className="mb-2.5">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Conversations
            </div>
            {results!.matchedConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="truncate font-medium">{conv.title || "Untitled Conversation"}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0 ml-2 font-mono">
                  <Calendar className="h-3 w-3" />
                  <span>{formatRelativeTime(conv.updatedAt || conv.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {hasMessages && (
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Messages
            </div>
            {results!.matchedMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelectConversation(msg.conversationId)}
                className="w-full rounded-xl px-3 py-2 text-left text-xs text-zinc-300 transition-colors hover:bg-white/[0.06] cursor-pointer mb-1.5"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span className="font-bold text-zinc-300">
                    {msg.role === "USER" ? "You" : "AVA"}
                  </span>
                  <span className="font-mono">{formatRelativeTime(msg.createdAt)}</span>
                </div>
                <p className="line-clamp-2 text-zinc-200 font-mono text-[11px] bg-[#111118] p-2.5 rounded-xl border border-white/[0.06]">
                  {msg.content}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
