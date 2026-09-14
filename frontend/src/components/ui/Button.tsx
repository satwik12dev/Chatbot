import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer tracking-tight";

    const variantStyles = {
      default:
        "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-400 hover:to-purple-500 active:scale-[0.98] shadow-md shadow-indigo-500/25 border border-indigo-400/30",
      secondary:
        "bg-[#121217] text-zinc-100 hover:bg-[#1b1b22] hover:text-white active:scale-[0.98] border border-white/[0.1] hover:border-white/[0.2] shadow-xs",
      outline:
        "border border-white/[0.12] bg-black/40 text-zinc-200 hover:bg-white/[0.08] hover:text-white hover:border-white/20 active:scale-[0.98]",
      ghost:
        "text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12]",
      destructive:
        "bg-red-950/80 text-red-200 border border-red-500/30 hover:bg-red-900/90 hover:border-red-500/50 shadow-sm shadow-red-950/40 active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-9 px-4 text-sm rounded-xl gap-2",
      lg: "h-11 px-6 text-base rounded-xl gap-2.5",
      icon: "h-9 w-9 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            {size !== "icon" && children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
