"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useConversationStore } from "@/store/conversationStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { createConversation, isCreating } = useConversationStore();
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const newConv = await createConversation();
      router.push(`/chat/${newConv.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create conversation");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-zinc-100 antialiased font-sans">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Sidebar (desktop and mobile drawer) */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-black">
        {/* Mobile Header Bar */}
        <header className="flex h-13 items-center justify-between border-b border-white/[0.08] bg-black/85 px-3.5 backdrop-blur-xl md:hidden shrink-0 z-20">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/30 border border-indigo-400/30">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">AVA</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleNewChat}
            isLoading={isCreating}
            className="h-8 px-2.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </header>

        {/* Content Body */}
        <main className="flex flex-1 flex-col overflow-hidden bg-black bg-mesh-dark">
          {children}
        </main>
      </div>
    </div>
  );
};
