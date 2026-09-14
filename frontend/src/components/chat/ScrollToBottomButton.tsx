"use client";

import React from "react";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  visible: boolean;
  onClick: () => void;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  visible,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 animate-in fade-in zoom-in-95">
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-medium text-zinc-200 shadow-xl backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white cursor-pointer"
      >
        <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />
        <span>New messages</span>
      </button>
    </div>
  );
};
