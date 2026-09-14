"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  Settings,
  Brain,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { SearchModal } from "./SearchModal";
import { useConversationStore } from "@/store/conversationStore";
import { useAuthStore } from "@/store/authStore";
import { groupConversationsByDate, cn } from "@/lib/utils";
import { ConversationResponse } from "@/types/api";
import { toast } from "sonner";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);
  const [activeMenuConvId, setActiveMenuConvId] = useState<string | null>(null);

  const {
    conversations,
    isLoading,
    isCreating,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
  } = useConversationStore();

  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Global shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewChat = async () => {
    try {
      const newConv = await createConversation();
      toast.success("New conversation started");
      if (onCloseMobile) onCloseMobile();
      router.push(`/chat/${newConv.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create conversation");
    }
  };

  const handleStartRename = (conv: ConversationResponse) => {
    setEditingConvId(conv.id);
    setEditTitle(conv.title || "Untitled Conversation");
    setActiveMenuConvId(null);
  };

  const handleSaveRename = async (convId: string) => {
    if (!editTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      await updateConversation(convId, { title: editTitle.trim() });
      toast.success("Conversation renamed");
    } catch (err: any) {
      toast.error(err.message || "Failed to rename");
    } finally {
      setEditingConvId(null);
    }
  };

  const handleToggleArchive = async (conv: ConversationResponse) => {
    try {
      await updateConversation(conv.id, { archived: !conv.archived });
      toast.success(conv.archived ? "Conversation unarchived" : "Conversation archived");
      setActiveMenuConvId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingConvId) return;
    try {
      await deleteConversation(deletingConvId);
      toast.success("Conversation deleted");
      if (pathname === `/chat/${deletingConvId}`) {
        router.push("/chat");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingConvId(null);
      setActiveMenuConvId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const grouped = groupConversationsByDate(conversations.filter((c) => !c.archived));

  const renderSection = (title: string, items: ConversationResponse[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {title}
        </div>
        <div className="space-y-0.5">
          {items.map((conv) => {
            const isActive = pathname === `/chat/${conv.id}`;
            const isEditing = editingConvId === conv.id;
            const isMenuOpen = activeMenuConvId === conv.id;

            return (
              <div
                key={conv.id}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-[#14141c] text-white font-semibold shadow-xs border border-white/[0.08]"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                )}
              >
                {isEditing ? (
                  <div className="flex w-full items-center gap-1.5 py-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(conv.id);
                        if (e.key === "Escape") setEditingConvId(null);
                      }}
                      className="w-full rounded-lg border border-indigo-500/80 bg-[#09090d] px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleSaveRename(conv.id)}
                      className="rounded p-1 text-zinc-400 hover:text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingConvId(null)}
                      className="rounded p-1 text-zinc-400 hover:text-zinc-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (onCloseMobile) onCloseMobile();
                        router.push(`/chat/${conv.id}`);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus:outline-none"
                    >
                      <MessageSquare
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-300"
                        )}
                      />
                      <span className="truncate text-xs tracking-tight">
                        {conv.title || "New conversation"}
                      </span>
                    </button>

                    {/* Context menu trigger */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuConvId(isMenuOpen ? null : conv.id);
                        }}
                        className={cn(
                          "rounded-md p-1 transition-opacity",
                          isMenuOpen ? "opacity-100 bg-white/[0.1] text-white" : "opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white"
                        )}
                        aria-label="Conversation options"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {isMenuOpen && (
                        <div
                          className="absolute right-0 top-7 z-50 w-36 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c0c12] p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleStartRename(conv)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleToggleArchive(conv)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08] hover:text-white cursor-pointer"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>{conv.archived ? "Unarchive" : "Archive"}</span>
                          </button>
                          <button
                            onClick={() => setDeletingConvId(conv.id)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/15 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col border-r border-white/[0.08] bg-[#060609] text-zinc-200 transition-all duration-300 ease-in-out z-30 shrink-0 select-none",
          isCollapsed ? "w-16" : "w-64",
          // Mobile responsive overlay
          isMobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-72 shadow-2xl flex"
            : "hidden md:flex"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-white/[0.08] bg-black/30">
          {!isCollapsed ? (
            <Link
              href="/chat"
              className="flex items-center gap-2.5 font-bold tracking-wider text-white group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30 border border-indigo-400/30">
                <Sparkles className="h-4 w-4 text-white drop-shadow-xs" />
              </div>
              <span className="text-base font-extrabold tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                AVA
              </span>
            </Link>
          ) : (
            <Tooltip content="AVA AI" side="right">
              <Link
                href="/chat"
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30 border border-indigo-400/30"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </Link>
            </Tooltip>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Action Buttons: New Chat & Search */}
        <div className="p-3 space-y-2">
          {!isCollapsed ? (
            <>
              <Button
                variant="default"
                onClick={handleNewChat}
                isLoading={isCreating}
                className="w-full justify-start gap-2.5 text-xs font-bold tracking-tight shadow-lg shadow-indigo-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </Button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#0c0c11] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/[0.18] hover:bg-[#121218] hover:text-zinc-200 cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </div>
                <kbd className="rounded border border-white/[0.1] bg-[#16161f] px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
                  ⌘K
                </kbd>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Tooltip content="New Chat" side="right">
                <Button
                  size="icon"
                  variant="default"
                  onClick={handleNewChat}
                  isLoading={isCreating}
                  className="h-9 w-9 rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Search (⌘K)" side="right">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-9 w-9 rounded-xl text-zinc-400 hover:text-white"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1">
          {!isCollapsed ? (
            <>
              {isLoading && conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400">
                  No conversations yet.
                  <br />
                  Start a new conversation with AVA.
                </div>
              ) : (
                <>
                  {renderSection("Today", grouped.today)}
                  {renderSection("Yesterday", grouped.yesterday)}
                  {renderSection("Previous 7 Days", grouped.previous7Days)}
                  {renderSection("Older", grouped.older)}
                </>
              )}
            </>
          ) : (
            <div className="space-y-1.5 flex flex-col items-center py-2">
              {conversations.slice(0, 10).map((conv) => (
                <Tooltip key={conv.id} content={conv.title || "Chat"} side="right">
                  <button
                    onClick={() => router.push(`/chat/${conv.id}`)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer",
                      pathname === `/chat/${conv.id}`
                        ? "bg-zinc-800 text-indigo-400"
                        : "text-zinc-500 hover:bg-zinc-850 hover:text-zinc-200"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Navigation & User Profile */}
        <div className="border-t border-white/[0.08] p-2.5 space-y-1 bg-black/20">
          {!isCollapsed ? (
            <>
              <Link
                href="/memory"
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  pathname === "/memory"
                    ? "bg-[#14141c] text-white border border-white/[0.08]"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                )}
              >
                <Brain className="h-4 w-4 text-purple-400" />
                <span>AVA Memory</span>
              </Link>

              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  pathname === "/settings"
                    ? "bg-[#14141c] text-white border border-white/[0.08]"
                    : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                )}
              >
                <Settings className="h-4 w-4 text-zinc-400" />
                <span>Settings</span>
              </Link>

              {/* User Bar */}
              <div className="mt-2 flex items-center justify-between rounded-xl bg-[#0c0c11] p-2 border border-white/[0.08] shadow-xs">
                <Link
                  href="/profile"
                  className="flex min-w-0 flex-1 items-center gap-2.5 hover:opacity-90 transition-opacity"
                >
                  <Avatar type="user" name={user?.name || "User"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-200">
                      {user?.name || "User"}
                    </p>
                    <p className="truncate text-[10px] text-zinc-400">
                      {user?.email || "user@ava.ai"}
                    </p>
                  </div>
                </Link>

                <Tooltip content="Sign Out" side="top">
                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-1">
              <Tooltip content="Memory" side="right">
                <Link
                  href="/memory"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-purple-400 hover:bg-zinc-850 transition-colors"
                >
                  <Brain className="h-4 w-4" />
                </Link>
              </Tooltip>

              <Tooltip content="Settings" side="right">
                <Link
                  href="/settings"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-850 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </Tooltip>

              <Tooltip content="Profile" side="right">
                <Link href="/profile">
                  <Avatar type="user" name={user?.name || "User"} size="sm" />
                </Link>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingConvId}
        onClose={() => setDeletingConvId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete conversation?"
        description="This conversation and all its messages will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete permanently"
      />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
