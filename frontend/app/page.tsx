
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import SmoothScroll from "../components/SmoothScroll";
import ScrollReveal from "../components/ScrollReveal";
import ScrollProgress from "../components/ScrollProgress";
import Parallax from "../components/Parallax";

export default function Home() {
  return (
    <SmoothScroll>
      <main className="relative overflow-hidden bg-[#060d0b]">

        <ScrollProgress />

        <Navbar />

        <Hero />

        <Features />

        <section
          id="about"
          className="relative flex min-h-screen items-center justify-center overflow-hidden border-t border-[#a1efc7]/10 px-6 py-32 text-center"
        >

          <Parallax
            speed={100}
            className="pointer-events-none absolute"
          >
            <div className="h-96 w-96 rounded-full bg-emerald-500/15 blur-[150px]" />
          </Parallax>

          <div className="relative z-10">

            <ScrollReveal>
              <p className="mb-8 text-xs tracking-[0.3em] text-[#a1efc7]">
                03 / OUR VISION
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <h2 className="text-6xl font-bold leading-none tracking-tighter md:text-9xl">
                Learn
                <span className="gradient-text block">
                  differently.
                </span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-[#8fa69b]">
                CampusGPT is an independent student-built
                platform designed to make academic information
                easier to discover and understand.
              </p>
            </ScrollReveal>

          </div>

        </section>

        <Footer />

      </main>
    </SmoothScroll>
  );
}
