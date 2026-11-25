
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Orbit, ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import TransitionLink from "./TransitionLink";

const links = [
  { name: "Home", href: "#home" },
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-5 left-0 right-0 z-50 px-4"
    >
      <nav className="mx-auto max-w-7xl rounded-full border border-[#a1efc7]/15 bg-[#060d0b]/75 px-6 py-4 backdrop-blur-2xl">

        <div className="flex items-center justify-between">

          {/* Logo */}

          <Link href="#home" className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="motion-reduce:hidden"
            >
              <Orbit size={30} color="#a1efc7" />
            </motion.div>

            <span className="text-xl font-bold tracking-tight">
              Campus<span className="text-[#a1efc7]">GPT</span>
            </span>
          </Link>

          {/* Desktop navigation */}

          <div className="hidden items-center gap-9 md:flex">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="group relative text-sm text-[#8fa69b] transition-colors hover:text-[#a1efc7]"
              >
                {link.name}

                <span className="absolute -bottom-2 left-0 h-px w-0 bg-[#a1efc7] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Launch button */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block"
          >
           <TransitionLink
  href="/chat"
  className="flex items-center gap-2 rounded-full bg-[#a1efc7] px-6 py-3 text-sm font-semibold text-[#060d0b]"
>
  Launch AI
  <ArrowUpRight size={17} />
</TransitionLink>
          </motion.div>

          {/* Mobile menu */}

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            className="text-[#a1efc7] md:hidden"
          >
            {isOpen ? <X /> : <Menu />}
          </button>

        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-5 pt-6 pb-3">
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-[#a1efc7]"
                  >
                    {link.name}
                  </a>
                ))}

              <TransitionLink href="/chat" className="neural-button">
  Launch AI <ArrowUpRight size={18} />
</TransitionLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </nav>
    </motion.header>
  );
}
