"use client";

import React, { useState, useEffect } from "react";
import { Brain, Trash2, ShieldAlert, Sparkles, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { memoryApi } from "@/api/memoryApi";
import { MemoryResponse, MemoryType } from "@/types/api";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

export const MemoryView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await memoryApi.getMemories();
      setMemories(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load memories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDeleteSingle = async () => {
    if (!deletingId) return;
    try {
      await memoryApi.deleteMemory(deletingId);
      setMemories((prev) => prev.filter((m) => m.id !== deletingId));
      toast.success("Memory deleted");
    } catch {
      toast.error("Failed to delete memory");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await memoryApi.deleteAllMemories();
      setMemories([]);
      toast.success("All memories cleared");
    } catch {
      toast.error("Failed to clear memories");
    } finally {
      setIsClearingAll(false);
    }
  };

  const filteredMemories =
    filterType === "ALL"
      ? memories
      : memories.filter((m) => m.memoryType === filterType);

  const getMemoryBadgeClass = (type: MemoryType) => {
    switch (type) {
      case "PREFERENCE":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "FACT":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "INSTRUCTION":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "PROFILE":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      default:
        return "bg-white/[0.08] text-zinc-300 border-white/[0.1]";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-black">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-xs">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">AVA Memory</h1>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Long-term facts, preferences, and guidelines autonomously synthesized by Gemini.
            </p>
          </div>

          {memories.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsClearingAll(true)}
              className="gap-1.5 font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear all memories</span>
            </Button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "PREFERENCE", "FACT", "INSTRUCTION", "PROFILE"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer border ${
                filterType === t
                  ? "bg-white/[0.12] text-white border-white/[0.18] shadow-xs"
                  : "border-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              {t === "ALL" ? "All Memories" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Memory Items */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            <span className="ml-2.5 text-xs font-medium text-zinc-400">Loading stored memories...</span>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/[0.1] bg-[#09090d]/40 p-12 text-center backdrop-blur-md">
            <Sparkles className="mx-auto h-8 w-8 text-indigo-400/50 mb-2" />
            <p className="text-sm font-bold text-white">No memories found</p>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
              As you interact with AVA, relevant details about your preferences, projects, and instructions will be remembered here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="group flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#09090d]/85 p-4.5 transition-all duration-200 hover:border-white/[0.18] hover:bg-[#111118] shadow-md backdrop-blur-xl"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider ${getMemoryBadgeClass(
                        memory.memoryType
                      )}`}
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {memory.memoryType}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-zinc-300">
                      {memory.memoryKey}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono ml-auto">
                      {formatRelativeTime(memory.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-100 leading-relaxed font-normal">
                    {memory.memoryValue}
                  </p>
                </div>

                <button
                  onClick={() => setDeletingId(memory.id)}
                  className="rounded-lg p-1.5 text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer shrink-0"
                  title="Delete memory"
                  aria-label="Delete memory"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Single Memory Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete this memory?"
        description="AVA will no longer use this specific fact or preference in future conversations."
        confirmLabel="Delete"
      />

      {/* Clear All Memories Modal */}
      <ConfirmModal
        isOpen={isClearingAll}
        onClose={() => setIsClearingAll(false)}
        onConfirm={handleClearAll}
        title="Clear all memories?"
        description="This will permanently wipe all facts and preferences remembered about you. This action cannot be undone."
        confirmLabel="Clear all"
      />
    </div>
  );
};
