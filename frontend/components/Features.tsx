
import {
  BrainCircuit,
  CalendarDays,
  BookOpen,
  Bell,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import BentoCard from "./BentoCard";
import AIShowcase from "./AIShowcase";
import ScrollReveal from "./ScrollReveal";

const features = [
  {
    icon: BookOpen,
    title: "Smart Resources",
    description:
      "Explore syllabus, notes and previous year question papers.",
    number: "03",
  },
  {
    icon: Bell,
    title: "Campus Updates",
    description:
      "Discover important announcements and academic notices.",
    number: "04",
  },
  {
    icon: BrainCircuit,
    title: "Intelligent Learning",
    description:
      "A smarter way to understand your academic subjects.",
    number: "05",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden px-6 py-32 md:px-12"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl">

        <ScrollReveal>
          <p className="mb-6 text-xs tracking-[0.3em] text-[#a1efc7]">
            02 / EXPLORE THE INTELLIGENCE
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className="text-5xl font-bold leading-none tracking-tighter md:text-8xl">
            One platform.

            <span className="gradient-text block">
              Infinite possibilities.
            </span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#8fa69b]">
            Everything your academic journey needs,
            designed into one seamless experience.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Main AI card */}

          <ScrollReveal className="md:col-span-2">
            <BentoCard>

              <div className="mb-6 flex items-center justify-between">
                <Sparkles size={32} className="text-[#a1efc7]" />

                <span className="text-xs text-[#8fa69b]">
                  01 / AI
                </span>
              </div>

              <h3 className="text-3xl font-bold">
                Campus Intelligence
              </h3>

              <p className="mb-8 mt-3 text-[#8fa69b]">
                Your personal academic AI assistant.
              </p>

              <AIShowcase />

            </BentoCard>
          </ScrollReveal>

          {/* Calendar card */}

          <ScrollReveal delay={0.15}>
            <BentoCard>

              <CalendarDays
                size={32}
                className="mb-6 text-[#a1efc7]"
              />

              <h3 className="text-2xl font-bold">
                Academic Calendar
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#8fa69b]">
                Organize your classes, exams and important dates.
              </p>

              <div className="mt-10 rounded-2xl border border-white/5 bg-[#060d0b] p-4">

                <div className="mb-5 flex items-center justify-between">

                  <span className="text-sm font-semibold">
                    Your Schedule
                  </span>

                  <CalendarDays
                    size={16}
                    className="text-[#a1efc7]"
                  />

                </div>

                <div className="grid grid-cols-7 gap-2">

                  {Array.from({ length: 28 }, (_, i) => (
                    <div
                      key={i}
                      className={`flex aspect-square items-center justify-center rounded-md text-[10px] ${
                        i === 17
                          ? "bg-[#a1efc7] font-bold text-[#060d0b]"
                          : "bg-[#10261f] text-[#8fa69b]"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}

                </div>

                <p className="mt-4 text-xs text-[#8fa69b]">
                  Calendar interface preview
                </p>

              </div>

            </BentoCard>
          </ScrollReveal>

          {/* Other feature cards */}

          {features.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              delay={index * 0.15}
            >
              <BentoCard>

                <div className="flex items-center justify-between">

                  <feature.icon
                    size={32}
                    className="text-[#a1efc7]"
                  />

                  <ArrowUpRight
                    size={20}
                    className="text-[#8fa69b] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                  />

                </div>

                <h3 className="mt-10 text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-[#8fa69b]">
                  {feature.description}
                </p>

                <p className="mt-8 text-xs tracking-widest text-[#a1efc7]/50">
                  {feature.number} / INTELLIGENCE
                </p>

              </BentoCard>
            </ScrollReveal>
          ))}

        </div>

      </div>
    </section>
  );
}
