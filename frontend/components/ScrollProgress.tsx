
"use client";

import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
} from "motion/react";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  const reducedMotion = useReducedMotion();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-[#a1efc7] shadow-[0_0_15px_#55d99b]"
      style={{
        scaleX: reducedMotion
          ? scrollYProgress
          : smoothProgress,
      }}
    />
  );
}
