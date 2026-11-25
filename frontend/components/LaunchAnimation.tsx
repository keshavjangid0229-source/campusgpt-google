"use client";

import { motion, useReducedMotion } from "motion/react";
import { Orbit } from "lucide-react";

export default function LaunchAnimation() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-label="Opening CampusGPT workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.35 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#060d0b]"
    >
      {/* Subtle background glow */}

      <div
        className="pointer-events-none absolute h-[400px] w-[400px] max-w-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(85,217,155,0.08), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center">

        {/* Logo animation */}

        <motion.div
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.85,
                  filter: "blur(8px)",
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: reducedMotion ? 0 : 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-[#a1efc7]"
          style={{
            filter: "drop-shadow(0 0 20px #55d99b40)",
          }}
        >
          <Orbit size={65} strokeWidth={1.3} />
        </motion.div>

        {/* Brand name */}

        <motion.h1
          initial={
            reducedMotion
              ? false
              : { opacity: 0, y: 8 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reducedMotion ? 0 : 0.15,
            duration: reducedMotion ? 0 : 0.45,
          }}
          className="mt-5 text-2xl font-medium tracking-tight text-[#f1f5f2]"
        >
          CampusGPT
        </motion.h1>

        {/* Minimal loading line */}

        <div className="mt-8 h-[2px] w-20 overflow-hidden rounded-full bg-[#20382c]">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: reducedMotion ? 0 : 0.95,
              ease: "easeInOut",
            }}
            className="h-full w-full origin-left rounded-full bg-[#a1efc7]"
          />
        </div>

      </div>
    </motion.div>
  );
}