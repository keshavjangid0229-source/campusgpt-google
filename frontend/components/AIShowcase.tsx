
"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Sparkles,
  ArrowUp,
  Bot,
  Circle,
} from "lucide-react";

const answer =
  "CampusGPT brings your syllabus, academic resources and campus information together in one intelligent workspace.";

export default function AIShowcase() {
  const [text, setText] = useState("");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let index = 0;

    const interval = window.setInterval(() => {
      index++;

      setText(answer.slice(0, index));

      if (index >= answer.length) {
        window.clearInterval(interval);
      }
    }, 35);

    return () => window.clearInterval(interval);
  }, [reduced]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#a1efc7]/15 bg-[#060d0b]">

      {/* Window header */}

      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">

        <div className="flex gap-2">
          <Circle size={9} fill="#ff6058" color="#ff6058" />
          <Circle size={9} fill="#ffbd2e" color="#ffbd2e" />
          <Circle size={9} fill="#28c840" color="#28c840" />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#a1efc7]">
          <Sparkles size={14} />
          CampusGPT Preview
        </div>

      </div>

      {/* Conversation */}

      <div className="space-y-5 p-5">

        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#1c3b2d] px-4 py-3 text-sm">
            What can CampusGPT do for me?
          </div>
        </div>

        <div className="flex items-start gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#a1efc7]/10">
            <Bot size={20} className="text-[#a1efc7]" />
          </div>

          <div className="min-h-28 rounded-2xl border border-white/5 bg-[#10261f]/50 p-4 text-sm leading-relaxed text-[#d3e8dc]">
            {reduced ? answer : text}

            {!reduced && text.length < answer.length && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className="ml-1 inline-block h-4 w-0.5 bg-[#a1efc7]"
              />
            )}
          </div>

        </div>

        {/* Input preview */}

        <div className="flex items-center justify-between rounded-full border border-[#a1efc7]/15 bg-white/5 px-4 py-2">

          <span className="text-xs text-[#8fa69b]">
            Ask CampusGPT anything...
          </span>

          <span className="rounded-full bg-[#a1efc7] p-2 text-[#060d0b]">
            <ArrowUp size={17} />
          </span>

        </div>

      </div>
    </div>
  );
}
