"use client";

import { useState } from "react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  Orbit,
  Copy,
  Check,
} from "lucide-react";

import MarkdownRenderer from "./MarkdownRenderer";
import type { ContextStats } from "../hooks/useChatHistory";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  contextStats?: ContextStats;
};

export default function ChatMessage({
  role,
  content,
  contextStats,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const reducedMotion = useReducedMotion();

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(content);

      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 8 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
      className={`flex ${
        role === "user"
          ? "justify-end"
          : "justify-start"
      }`}
    >

      {role === "user" ? (

        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[22px] rounded-br-md border border-[#a1efc720] bg-[#10261f] px-5 py-4 text-sm leading-relaxed">

          {content}

        </div>

      ) : (

        <div className="flex w-full min-w-0 items-start gap-3 md:gap-4">

          {/* AI avatar */}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#a1efc725] bg-[#10261f] text-[#a1efc7]">

            <Orbit size={23} strokeWidth={1.6} />

          </div>

          {/* Response */}

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <p className="text-sm font-semibold text-[#a1efc7]">
                CampusGPT
              </p>

              <span className="rounded-full border border-[#a1efc720] px-2 py-0.5 text-[9px] text-[#8fa69b]">
                AI
              </span>

            </div>

            <MarkdownRenderer content={content} />
            {contextStats && (
              <details className="mt-3 text-xs leading-6 text-[#8fa69b]">
                <summary className="cursor-pointer">Context usage</summary>
                <p>
                  {contextStats.selected_messages} previous messages
                </p>
                {contextStats.input_tokens != null && contextStats.output_tokens != null && <p>
                  {contextStats.input_tokens} input tokens · {contextStats.output_tokens} output tokens
                </p>}
              </details>
            )}

            {/* Response actions */}

            <div className="mt-4 flex items-center gap-2">

              <button
                onClick={copyMessage}
                aria-label="Copy response"
                title="Copy response"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#8fa69b] transition hover:bg-white/5 hover:text-[#a1efc7]"
              >

                {copied ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}

                {copied && "Copied"}

              </button>

            </div>

          </div>

        </div>

      )}

    </motion.div>
  );
}
