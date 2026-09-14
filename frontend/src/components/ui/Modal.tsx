"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-3xl border border-white/[0.1] bg-[#0c0c12]/95 p-6 text-white shadow-2xl backdrop-blur-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95 focus:outline-none",
            className
          )}
        >
          {title && (
            <div className="mb-4">
              <DialogPrimitive.Title className="text-lg font-bold tracking-tight text-white">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
          )}

          {children}

          {showCloseButton && (
            <DialogPrimitive.Close
              onClick={onClose}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
