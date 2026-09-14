"use client";

import React from "react";
import { Settings, Moon, Sun, Monitor, MessageSquare, Mic, Volume2 } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export const SettingsView: React.FC = () => {
  const {
    theme,
    enterToSend,
    showTimestamps,
    streamResponses,
    autoPlayVoice,
    voiceSpeed,
    setTheme,
    setEnterToSend,
    setShowTimestamps,
    setStreamResponses,
    setAutoPlayVoice,
    setVoiceSpeed,
  } = useSettingsStore();

  const { setTheme: setNextTheme } = useTheme();

  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    setTheme(newTheme);
    setNextTheme(newTheme);
    toast.success(`Theme set to ${newTheme}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-black">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#121218] text-indigo-400 border border-white/[0.1] shadow-xs">
              <Settings className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">Settings</h1>
              <p className="text-xs text-zinc-400">
                Customize your AVA workspace and interaction preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Appearance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "dark", label: "Dark (OLED)", icon: Moon },
              { id: "light", label: "Light", icon: Sun },
              { id: "system", label: "System", icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleThemeChange(item.id as any)}
                  className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/10"
                      : "border-white/[0.08] bg-[#09090d]/90 text-zinc-400 hover:border-white/[0.2] hover:bg-[#111118] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Chat Settings */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Chat Preferences
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090d]/80 divide-y divide-white/[0.06] shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between p-4.5">
              <div>
                <p className="text-sm font-semibold text-zinc-100">Enter to Send</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Press Enter to send message, Shift+Enter for a new line.
                </p>
              </div>
              <input
                type="checkbox"
                checked={enterToSend}
                onChange={(e) => setEnterToSend(e.target.checked)}
                className="h-4.5 w-4.5 rounded-md border-white/[0.2] bg-[#121218] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-4.5">
              <div>
                <p className="text-sm font-semibold text-zinc-100">Show Message Timestamps</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Display relative timestamps next to messages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={showTimestamps}
                onChange={(e) => setShowTimestamps(e.target.checked)}
                className="h-4.5 w-4.5 rounded-md border-white/[0.2] bg-[#121218] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="flex items-center justify-between p-4.5">
              <div>
                <p className="text-sm font-semibold text-zinc-100">Stream Responses</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Stream Gemini&apos;s output progressively token by token.
                </p>
              </div>
              <input
                type="checkbox"
                checked={streamResponses}
                onChange={(e) => setStreamResponses(e.target.checked)}
                className="h-4.5 w-4.5 rounded-md border-white/[0.2] bg-[#121218] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </section>

        {/* Voice Settings */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
            Voice & Audio
          </h2>
          <div className="rounded-2xl border border-white/[0.08] bg-[#09090d]/80 divide-y divide-white/[0.06] shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between p-4.5">
              <div>
                <p className="text-sm font-semibold text-zinc-100">Auto-Play Voice Responses</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Automatically play speech audio for synthesized responses.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoPlayVoice}
                onChange={(e) => setAutoPlayVoice(e.target.checked)}
                className="h-4.5 w-4.5 rounded-md border-white/[0.2] bg-[#121218] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="p-4.5 space-y-2.5">
              <div className="flex justify-between items-center text-sm font-semibold text-zinc-100">
                <span>Voice Speed</span>
                <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{voiceSpeed}x</span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.5}
                step={0.25}
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#181822] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
