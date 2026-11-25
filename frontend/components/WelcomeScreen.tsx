"use client";

import { useEffect, useState } from "react";

import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  BookOpen,
  FileText,
  CalendarDays,
  BrainCircuit,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

type WelcomeScreenProps = {
  onSelect: (question: string) => void;
  disabled?: boolean;
};

const suggestions = [
  {
    icon: BookOpen,
    title: "Explore syllabus",
    description: "Understand your academic curriculum",
    prompt: "Help me explore my semester syllabus.",
  },
  {
    icon: FileText,
    title: "Find PYQs",
    description: "Prepare smarter for your exams",
    prompt: "Help me find previous year question papers.",
  },
  {
    icon: CalendarDays,
    title: "Exam schedule",
    description: "Stay ahead of important deadlines",
    prompt: "Help me check my upcoming exam schedule.",
  },
  {
    icon: BrainCircuit,
    title: "Explain a topic",
    description: "Make complex concepts simple",
    prompt: "Help me understand a difficult academic topic.",
  },
];

export default function WelcomeScreen({
  onSelect,
  disabled = false,
}: WelcomeScreenProps) {
  const [greeting, setGreeting] = useState("Welcome");

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    function updateGreeting() {
      const hour = new Date().getHours();

      if (hour < 12) {
        setGreeting("Good morning");
      } else if (hour < 17) {
        setGreeting("Good afternoon");
      } else {
        setGreeting("Good evening");
      }
    }

    updateGreeting();

    const timer = setInterval(updateGreeting, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: 12 }
      }
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        y: reducedMotion ? 0 : -8,
      }}
      transition={{
        duration: reducedMotion ? 0 : 0.5,
      }}
      className="m-auto w-full max-w-[780px] px-5 py-8"
    >
      {/* Neural logo */}

      <div className="mb-6 flex justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">

          <div className="absolute inset-0 rounded-full bg-[#55d99b]/10 blur-2xl" />

          <div className="absolute inset-0 rounded-full border border-[#a1efc720]" />

          <motion.div
            animate={
              reducedMotion
                ? {}
                : { rotate: 360 }
            }
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-2 rounded-full border border-dashed border-[#a1efc725]"
          >
            <div className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-[#a1efc7] shadow-[0_0_12px_#a1efc7]" />
          </motion.div>

          <svg
            viewBox="0 0 100 100"
            className="relative h-20 w-20"
            fill="none"
            aria-hidden="true"
          >
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="15"
              transform="rotate(45 50 50)"
              stroke="#a1efc7"
              strokeWidth="1.5"
            />

            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="15"
              transform="rotate(-45 50 50)"
              stroke="#a1efc7"
              strokeWidth="1.5"
            />

            <circle
              cx="50"
              cy="50"
              r="5"
              fill="#a1efc7"
            />
          </svg>
        </div>
      </div>

      {/* Greeting */}

      <div className="text-center">

        <div className="mb-4 flex items-center justify-center gap-2 text-[10px] tracking-[3px] text-[#a1efc7]">
          <Sparkles size={13} />
          YOUR ACADEMIC COMPANION
        </div>

        <motion.h1
          initial={
            reducedMotion
              ? false
              : { opacity: 0, y: 8 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-semibold tracking-[-1.5px] text-[#f1f5f2] md:text-[46px]"
        >
          {greeting}, Student.
        </motion.h1>

        <h2 className="mt-3 text-xl font-medium tracking-tight text-[#a1efc7] md:text-2xl">
          What shall we explore today?
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#8fa69b]">
          One workspace for everything you want to learn.
        </p>
      </div>

      {/* Suggestion cards */}

      <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">

        {suggestions.map((item, index) => (
          <motion.button
            key={item.title}
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: reducedMotion ? 0 : index * 0.07,
            }}
            whileHover={
              reducedMotion ? {} : { y: -3 }
            }
            whileTap={
              reducedMotion ? {} : { scale: 0.98 }
            }
            disabled={disabled}
            onClick={() => onSelect(item.prompt)}
            className="group relative overflow-hidden rounded-2xl border border-[#a1efc720] bg-[#10261f]/50 p-5 text-left transition-colors hover:border-[#a1efc760] hover:bg-[#10261f] disabled:opacity-50"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#55d99b]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative mb-4 flex items-center justify-between">

              <div className="rounded-xl border border-[#a1efc715] bg-[#a1efc710] p-2.5">

                <item.icon
                  size={22}
                  strokeWidth={1.6}
                  className="text-[#a1efc7]"
                />

              </div>

              <ArrowUpRight
                size={18}
                className="text-[#657d70] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#a1efc7]"
              />

            </div>

            <h3 className="relative text-sm font-medium text-[#f1f5f2]">
              {item.title}
            </h3>

            <p className="relative mt-2 text-xs leading-relaxed text-[#8fa69b]">
              {item.description}
            </p>

          </motion.button>
        ))}

      </div>
    </motion.div>
  );
}