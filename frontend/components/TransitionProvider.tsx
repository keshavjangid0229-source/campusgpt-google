"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useRouter, usePathname } from "next/navigation";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import LaunchAnimation from "./LaunchAnimation";

type TransitionContextType = {
  navigate: (href: string) => void;
};

const TransitionContext =
  createContext<TransitionContextType | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);

  if (!context) {
    throw new Error(
      "usePageTransition must be used inside TransitionProvider"
    );
  }

  return context;
}

export default function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const [loading, setLoading] = useState(false);

  const target = useRef<string | null>(null);

  const navigationTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const fallbackTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (navigationTimer.current) {
      clearTimeout(navigationTimer.current);
      navigationTimer.current = null;
    }

    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
  }

  function navigate(href: string) {
    if (href === pathname || target.current) return;

    if (reducedMotion) {
      router.push(href);
      return;
    }

    // Animate only when opening the AI workspace.

    if (href !== "/chat") {
      router.push(href);
      return;
    }

    target.current = href;

    router.prefetch(href);

    setLoading(true);

    navigationTimer.current = setTimeout(() => {
      router.push(href);
    }, 1000);

    // Prevent the overlay from getting stuck.

    fallbackTimer.current = setTimeout(() => {
      target.current = null;
      setLoading(false);
      clearTimers();
    }, 8000);
  }

  useEffect(() => {
    if (target.current === pathname) {
      target.current = null;
      setLoading(false);
      clearTimers();
    }
  }, [pathname]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <TransitionContext.Provider value={{ navigate }}>

      <motion.div
        key={pathname}
        initial={
          reducedMotion
            ? false
            : {
                opacity: 0,
                y: 5,
                filter: "blur(4px)",
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="min-h-dvh"
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {loading && <LaunchAnimation />}
      </AnimatePresence>

    </TransitionContext.Provider>
  );
}