
"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import TransitionLink from "./TransitionLink";
import NeuralWave from "./NeuralWave";


export default function Hero() {
  const reduced = useReducedMotion();

  const reveal = {
    hidden: {
      opacity: 0,
      y: reduced ? 0 : 60,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#060d0b]"
    >
      {/* Neural background */}

      <NeuralWave />

      {/* Background glow */}

      <div className="pointer-events-none absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[150px]" />

      {/* Grid overlay */}

      <div className="neural-grid pointer-events-none absolute inset-0 opacity-40" />

      {/* Main content */}

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: reduced ? 0 : 0.18,
          delayChildren: reduced ? 0 : 0.2,
        }}
        className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28 pt-36 md:px-12"
      >
        {/* Top badge */}

        <motion.div
          variants={reveal}
          transition={{ duration: 0.7 }}
          className="mb-10 inline-flex items-center gap-3 rounded-full border border-[#a1efc7]/20 bg-[#a1efc7]/5 px-5 py-3"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>

          <span className="text-[10px] tracking-[0.2em] text-[#a1efc7]">
            THE NEXT GENERATION OF CAMPUS AI
          </span>
        </motion.div>

        {/* Animated heading */}

        <h1 className="text-[clamp(3.5rem,9vw,9rem)] font-bold leading-[0.95] tracking-[-0.075em]">

          <div className="overflow-hidden pb-2">
            <motion.span
              variants={reveal}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="block text-white"
            >
              Knowledge.
            </motion.span>
          </div>

          <div className="overflow-hidden pb-3">
            <motion.span
              variants={reveal}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="gradient-text block"
            >
              Without limits.
            </motion.span>
          </div>

        </h1>

        {/* Description */}

        <motion.p
          variants={reveal}
          transition={{ duration: 0.8 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-[#8fa69b] md:text-xl"
        >
          Your academic world, connected by intelligence.
          Discover a smarter way to learn, explore and
          experience your campus.
        </motion.p>

        {/* Action buttons */}

        <motion.div
          variants={reveal}
          transition={{ duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <motion.div
            whileHover={{ scale: reduced ? 1 : 1.04 }}
            whileTap={{ scale: reduced ? 1 : 0.96 }}
          >
           <TransitionLink href="/chat" className="neural-button">
  <Sparkles size={18} />
  Explore Intelligence
  <ArrowUpRight size={18} />
</TransitionLink>
          </motion.div>

          <a
            href="#features"
            className="neural-button-outline"
          >
            Discover Features
          </a>
        </motion.div>

        {/* Bottom information */}

        <motion.div
          variants={reveal}
          className="mt-12 flex flex-wrap items-center gap-5 text-xs tracking-wider text-[#8fa69b]"
        >
          <span>AI-POWERED</span>

          <span className="h-1 w-1 rounded-full bg-[#a1efc7]" />

          <span>STUDENT-FIRST</span>

          <span className="h-1 w-1 rounded-full bg-[#a1efc7]" />

          <span>BUILT FOR USAR</span>
        </motion.div>

      </motion.div>

      {/* Scroll indicator */}

      <motion.a
        href="#features"
        animate={reduced ? { y: 0 } : { y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: reduced ? 0 : Infinity,
        }}
        className="absolute bottom-8 left-6 z-20 flex items-center gap-3 text-[#a1efc7] md:left-12"
      >
        <ArrowDown size={18} />

        <span className="text-[10px] tracking-[0.25em]">
          SCROLL TO DISCOVER
        </span>
      </motion.a>

      {/* Section number */}

      <div className="absolute bottom-8 right-8 hidden text-xs tracking-widest text-[#8fa69b] md:block">
        01 / INTELLIGENCE
      </div>

    </section>
  );
}


