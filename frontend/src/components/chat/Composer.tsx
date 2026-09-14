"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Plus, Mic, X, FileText, Loader2 } from "lucide-react";
import { VoiceRecorderModal } from "./VoiceRecorderModal";
import { voiceApi } from "@/api/voiceApi";
import { toast } from "sonner";

interface AttachedFile {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
}

interface ComposerProps {
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  disabled?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  disabled = false,
}) => {
  const [content, setContent] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isStreaming || disabled) return;

    // Append attached file names if any
    let finalMessage = trimmed;
    if (attachedFiles.length > 0) {
      const fileNames = attachedFiles.map((f) => f.name).join(", ");
      finalMessage += `\n\n[Attached files: ${fileNames}]`;
    }

    onSendMessage(finalMessage);
    setContent("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 10MB limit validation
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds maximum allowed size (10MB).`);
        continue;
      }
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      newFiles.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        name: file.name,
        sizeFormatted: `${sizeMB} MB`,
      });
    }

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleVoiceAudioReady = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    toast.info("Transcribing audio with Gemini...");
    try {
      const res = await voiceApi.transcribe(audioBlob, "recording.webm");
      if (res.data?.transcribedText) {
        setContent((prev) =>
          prev ? `${prev} ${res.data.transcribedText}` : res.data.transcribedText
        );
        toast.success("Voice transcribed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const hasContent = content.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-5">
      {/* File Attachment Previews */}
      {attachedFiles.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#111118] px-3 py-1.5 text-xs text-zinc-200 shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span className="max-w-[150px] truncate font-medium">{file.name}</span>
              <span className="text-[10px] text-zinc-400">{file.sizeFormatted}</span>
              <button
                onClick={() => removeFile(file.id)}
                className="rounded-full p-0.5 text-zinc-400 hover:bg-white/[0.1] hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Composer Card */}
      <div className="relative rounded-2xl border border-white/[0.12] bg-[#09090d]/90 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-200 focus-within:border-indigo-500/80 focus-within:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
        <div className="flex items-end px-3 py-2.5 gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isStreaming}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            title="Attach file (PDF, text, images)"
            aria-label="Attach file"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Message AVA..."
            className="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-white placeholder:text-zinc-500 focus:outline-none leading-relaxed"
          />

          {/* Voice Record Button */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            disabled={disabled || isStreaming || isTranscribing}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
            title="Voice input"
            aria-label="Record voice"
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Send / Stop Streaming Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer active:scale-95"
              title="Stop generating"
              aria-label="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current text-red-300" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasContent || disabled}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all ${
                hasContent && !disabled
                  ? "bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/30 hover:from-indigo-400 hover:to-purple-500 active:scale-95 cursor-pointer border border-indigo-400/30"
                  : "bg-[#14141a] text-zinc-600 border border-white/[0.05] cursor-not-allowed"
              }`}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-center text-[11px] text-zinc-400 select-none">
        AVA can make mistakes. Verify important information.
      </div>

      {/* Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAudioReady={handleVoiceAudioReady}
      />
    </div>
  );
};
