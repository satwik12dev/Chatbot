import React from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AvatarProps {
  type: "user" | "assistant";
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  type,
  name,
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  if (type === "assistant") {
    return (
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/30",
          sizeClasses[size],
          className
        )}
        aria-label="AVA AI Assistant"
      >
        <Sparkles className="h-4 w-4 text-white drop-shadow-sm" />
      </div>
    );
  }

  // User Avatar
  const initial = (name || "User").charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl bg-[#15151c] font-bold text-white border border-white/[0.12] shadow-xs",
        sizeClasses[size],
        className
      )}
      aria-label={name || "User"}
    >
      {initial}
    </div>
  );
};
