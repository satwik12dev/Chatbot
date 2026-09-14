"use client";

import React from "react";
import { Sparkles, Code2, BookOpen, BarChart3, Lightbulb } from "lucide-react";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: BookOpen,
    title: "Explain a complex concept",
    prompt: "Can you explain quantum computing and its practical applications in simple terms?",
    accentColor: "text-blue-400 group-hover:text-blue-300",
    iconBg: "bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
  },
  {
    icon: Code2,
    title: "Write clean, resilient code",
    prompt: "Write a high-performance Java 24 service with structured concurrency and error handling.",
    accentColor: "text-indigo-400 group-hover:text-indigo-300",
    iconBg: "bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500/20",
  },
  {
    icon: BarChart3,
    title: "Analyze and synthesize data",
    prompt: "How can I design an enterprise-grade rate limiter with a sliding window counter?",
    accentColor: "text-emerald-400 group-hover:text-emerald-300",
    iconBg: "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20",
  },
  {
    icon: Lightbulb,
    title: "Brainstorm product ideas",
    prompt: "Brainstorm 5 innovative AI features for a modern personal knowledge management tool.",
    accentColor: "text-amber-400 group-hover:text-amber-300",
    iconBg: "bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20",
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center select-none">
      {/* AVA Cinematic Emblem */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 border border-indigo-400/30">
          <Sparkles className="h-8 w-8 drop-shadow-md" />
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
        Welcome to AVA
      </h1>
      <p className="mt-2 text-sm sm:text-base font-medium text-zinc-300 max-w-md">
        Your intelligent AI companion.
      </p>
      <p className="mt-1 text-xs text-zinc-400 max-w-sm">
        Ask deep questions, synthesize code, explore ideas, or automate your workflows.
      </p>

      {/* Suggested Prompts Grid */}
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-3.5 sm:grid-cols-2 text-left">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group flex items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-[#09090d]/80 p-4.5 transition-all duration-200 hover:border-white/[0.2] hover:bg-[#111118] hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:scale-[1.01] cursor-pointer shadow-md backdrop-blur-md"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${item.iconBg} ${item.accentColor}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
