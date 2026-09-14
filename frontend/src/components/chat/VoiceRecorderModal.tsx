"use client";

import React, { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Mic, Square, X, AlertCircle } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioReady: (blob: Blob) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onAudioReady,
}) => {
  const {
    recorderState,
    duration,
    errorMessage,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      cancelRecording();
    }
  }, [isOpen, startRecording, cancelRecording]);

  const handleStop = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      onAudioReady(audioBlob);
      onClose();
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onClose();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} showCloseButton={false} className="max-w-sm text-center p-8">
      {/* Microphone Icon with Animated Ripple */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
        {recorderState === "recording" && (
          <>
            <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-500/20 duration-1000" />
            <div className="absolute h-16 w-16 animate-pulse rounded-full bg-indigo-600/30" />
          </>
        )}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
          <Mic className="h-6 w-6 animate-pulse" />
        </div>
      </div>

      <div className="mt-5 space-y-1">
        <h3 className="text-base font-semibold text-zinc-100">
          {recorderState === "requesting"
            ? "Requesting Microphone..."
            : recorderState === "recording"
            ? "Listening..."
            : "Processing Audio..."}
        </h3>
        <p className="text-2xl font-mono font-medium text-zinc-300">
          {formatTimer(duration)}
        </p>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          <span>Cancel</span>
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleStop}
          disabled={recorderState !== "recording"}
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-500"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          <span>Stop & Send</span>
        </Button>
      </div>
    </Modal>
  );
};
