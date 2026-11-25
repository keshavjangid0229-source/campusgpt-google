"use client";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import { Orbit } from "lucide-react";

export default function TypingIndicator() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-label="Waiting for CampusGPT response"
      initial={
        reducedMotion ? false : { opacity: 0 }
      }
      animate={{ opacity: 1 }}
      className="flex items-start gap-4 py-2"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#a1efc725] bg-[#10261f] text-[#a1efc7]">

        <Orbit size={23} />

      </div>

      <div>

        <p className="mb-3 text-sm font-medium text-[#a1efc7]">
          CampusGPT
        </p>

        <div className="flex items-center gap-1.5">

          {[0, 1, 2].map((index) => (

            <motion.span
              key={index}
              animate={
                reducedMotion
                  ? {}
                  : {
                      opacity: [0.3, 1, 0.3],
                      y: [0, -4, 0],
                    }
              }
              transition={{
                duration: 1.2,
                repeat: reducedMotion ? 0 : Infinity,
                delay: index * 0.15,
              }}
              className="h-1.5 w-1.5 rounded-full bg-[#a1efc7]"
            />

          ))}

          <span className="ml-2 text-xs text-[#8fa69b]">
            Thinking...
          </span>

        </div>

      </div>

    </motion.div>
  );
}