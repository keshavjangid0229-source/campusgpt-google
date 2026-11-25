
"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { Orbit } from "lucide-react";

export default function StartupLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const reduced = useReducedMotion();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(value + 5, 100));
    }, 60);

    const timeout = window.setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && !reduced && (
        <motion.div
          aria-hidden="true"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            duration: 0.9,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060d0b]"
        >

          <div className="absolute h-80 w-80 rounded-full bg-emerald-500/10 blur-[120px]" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="relative mb-8"
          >
            <Orbit size={80} color="#a1efc7" />
          </motion.div>

          <h1 className="relative text-4xl font-bold tracking-tighter">
            Campus<span className="text-[#a1efc7]">GPT</span>
          </h1>

          <p className="mt-4 text-[10px] tracking-[0.35em] text-[#8fa69b]">
            INITIALIZING EXPERIENCE
          </p>

          <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-[#10261f]">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#a1efc7]"
            />
          </div>

          <p className="mt-4 text-xs text-[#a1efc7]">
            {progress}%
          </p>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
