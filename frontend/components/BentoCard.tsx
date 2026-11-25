
"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function BentoCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      whileHover={reduced ? {} : { y: -5 }}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        ref.current.style.setProperty(
          "--mouse-x",
          `${e.clientX - rect.left}px`
        );

        ref.current.style.setProperty(
          "--mouse-y",
          `${e.clientY - rect.top}px`
        );
      }}
      className={`group relative h-full overflow-hidden rounded-[28px] border border-[#a1efc7]/10 bg-[#0c1b15] p-7 transition-colors hover:border-[#a1efc7]/40 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(161,239,199,0.13), transparent 80%)",
        }}
      />

      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
}
