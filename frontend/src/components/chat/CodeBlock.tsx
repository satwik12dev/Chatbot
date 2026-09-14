"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, Copy, Terminal, Code2 } from "lucide-react";
import Prism from "prismjs";

// Import common language grammars for Prism
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";

interface CodeBlockProps {
  language?: string;
  value: string;
}

// Map language aliases to Prism grammar names
function normalizeLanguage(lang?: string): string {
  if (!lang) return "javascript";
  const lower = lang.toLowerCase().trim();
  const map: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    sh: "bash",
    shell: "bash",
    zsh: "bash",
    yml: "yaml",
    cs: "csharp",
    "c#": "csharp",
    "c++": "cpp",
    golang: "go",
    rs: "rust",
  };
  return map[lower] || lower;
}

// Get colorful accent styling for the language badge
function getLanguageColor(lang: string): { bg: string; text: string; border: string } {
  switch (lang) {
    case "java":
      return { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" };
    case "python":
      return { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
    case "typescript":
    case "tsx":
      return { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" };
    case "javascript":
    case "jsx":
      return { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" };
    case "bash":
      return { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" };
    case "sql":
      return { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" };
    case "json":
    case "yaml":
      return { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" };
    case "rust":
      return { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" };
    case "go":
      return { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30" };
    default:
      return { bg: "bg-indigo-500/15", text: "text-indigo-400", border: "border-indigo-500/30" };
  }
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = "", value }) => {
  const [copied, setCopied] = useState(false);

  const cleanLang = normalizeLanguage(language);
  const langBadge = language.trim() ? language.toUpperCase() : "CODE";
  const badgeColors = getLanguageColor(cleanLang);

  // Syntax highlight code HTML with Prism
  const highlightedCode = useMemo(() => {
    const grammar = Prism.languages[cleanLang] || Prism.languages.javascript;
    try {
      return Prism.highlight(value, grammar, cleanLang);
    } catch {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [value, cleanLang]);

  // Compute line numbers
  const lines = useMemo(() => value.split("\n"), [value]);
  const showLineNumbers = lines.length > 1;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative my-5 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#07070b] shadow-2xl transition-all duration-200 hover:border-white/[0.2] selection:bg-indigo-500/30">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0d0d14] px-4 py-2.5">
        {/* Terminal Window Dots & Language Badge */}
        <div className="flex items-center gap-3">
          {/* macOS window control dots */}
          <div className="flex items-center gap-1.5 select-none" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]/40 shadow-xs" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]/40 shadow-xs" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]/40 shadow-xs" />
          </div>

          {/* Language Pill */}
          <span
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider border shadow-xs ${badgeColors.bg} ${badgeColors.text} ${badgeColors.border}`}
          >
            <Code2 className="h-3 w-3" />
            {langBadge}
          </span>

          <span className="hidden sm:inline text-[11px] font-mono text-zinc-400">
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </span>
        </div>

        {/* Copy Code Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-zinc-300 transition-all hover:bg-white/[0.12] hover:text-white hover:border-white/[0.2] active:scale-95 cursor-pointer shadow-xs"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="flex overflow-x-auto p-4 text-xs font-mono leading-relaxed bg-[#07070b]">
        {showLineNumbers && (
          <div
            className="flex flex-col select-none pr-4 text-right font-mono text-[11px] text-zinc-400 border-r border-white/[0.08]"
            aria-hidden="true"
          >
            {lines.map((_, i) => (
              <span key={i} className="leading-relaxed">
                {i + 1}
              </span>
            ))}
          </div>
        )}

        {/* Highlighted Code Content */}
        <pre className={`m-0 flex-1 overflow-x-auto font-mono text-xs text-zinc-100 ${showLineNumbers ? "pl-4" : "pl-1"}`}>
          <code
            className={`language-${cleanLang} leading-relaxed font-mono`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};
