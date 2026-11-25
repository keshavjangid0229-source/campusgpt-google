

import { Orbit, ArrowUpRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import TransitionLink from "./TransitionLink";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#a1efc7]/10">

      {/* Final CTA */}

      <section className="relative px-6 py-36 text-center">

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[150px]" />

        <div className="relative z-10">

          <ScrollReveal>
            <p className="mb-8 text-xs tracking-[0.3em] text-[#a1efc7]">
              THE FUTURE STARTS HERE
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h2 className="text-6xl font-bold leading-none tracking-tighter md:text-9xl">
              Your campus.

              <span className="gradient-text block">
                Reimagined.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="mx-auto mt-8 max-w-lg text-lg text-[#8fa69b]">
              A new way to experience your academic world.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.45}>
           <TransitionLink href="/chat" className="neural-button mt-10">
  Launch CampusGPT
  <ArrowUpRight size={20} />
</TransitionLink>
          </ScrollReveal>

        </div>

      </section>

      {/* Footer navigation */}

      <div className="border-t border-[#a1efc7]/10 px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8">

          <div>
            <div className="flex items-center gap-3">
              <Orbit size={28} className="text-[#a1efc7]" />

              <span className="text-xl font-bold">
                CampusGPT
              </span>
            </div>

            <p className="mt-3 text-xs text-[#8fa69b]">
              Built for students. Powered by intelligence.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-[#8fa69b]">

            <a href="#home" className="hover:text-[#a1efc7]">
              Home
            </a>

            <a href="#features" className="hover:text-[#a1efc7]">
              Features
            </a>

            <a href="#about" className="hover:text-[#a1efc7]">
              About
            </a>

          </div>

        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-white/5 pt-6 text-xs leading-relaxed text-[#8fa69b]">
          © 2026 CampusGPT. An independent student project.
          Not an official university platform.
        </div>

      </div>

    </footer>
  );
}
