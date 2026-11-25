
"use client";

import { useRef, type ReactNode } from "react";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";

export default function Parallax({
  children,
  className = "",
  speed = 100,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [-speed, speed]
  );

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{ y: reducedMotion ? 0 : y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
