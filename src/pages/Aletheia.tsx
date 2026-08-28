import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import AtmosphereField from "@/components/hero/AtmosphereField";
import { EASE } from "@/lib/motion";

const charterLead = [
  "Technology is one of humanity's greatest tools.",
  "When guided by wisdom, integrity, and purpose, it can expand opportunity, strengthen communities, and improve lives.",
  "At Athena Data Labs, we believe technology exists to serve people, not the other way around.",
  "We measure success not by the complexity of what we build, but by the value it creates for those we serve.",
];

const charterCore = [
  "Our mission is to build intelligent software and data solutions that transform complexity into clarity.",
  "Through thoughtful engineering, privacy first design, and responsible use of artificial intelligence, we empower individuals, organizations, and communities to make informed decisions with confidence.",
  "Our vision is a future where trustworthy technology is accessible to everyone, where data illuminates rather than overwhelms, where artificial intelligence enhances human judgment rather than replacing it, and where innovation is always grounded in ethics, transparency, and service.",
];

const beliefs = [
  "Truth is discovered through evidence, not assumption.",
  "Privacy is a fundamental right.",
  "Innovation should always have purpose.",
  "Technology should empower, not control.",
  "Service is more important than self.",
  "Craftsmanship matters.",
  "Learning is a lifelong pursuit.",
];

const charterClose = [
  "Our promise is to build technology that is intelligent without being intrusive, powerful without unnecessary complexity, and designed to serve people first.",
  "Named for my daughter Athena, and inspired by the timeless ideal of wisdom, Athena Data Labs exists to build more than software; we aspire to build a legacy.",
];

/** The charter reads as four movements; the rail tracks which one you are in. */
const MOVEMENTS = [
  { id: "premise", numeral: "I", label: "Premise" },
  { id: "mission", numeral: "II", label: "Mission & Vision" },
  { id: "beliefs", numeral: "III", label: "We Believe" },
  { id: "promise", numeral: "IV", label: "The Promise" },
] as const;

/* ── Scroll-scrubbed reveal ───────────────────────────────────────────────
   Tied to scroll position rather than fired once on entry, so the page reads
   as one continuous move. It completes well above the reading line: a
   manifesto you have to keep scrolling to finish a sentence of is a failure. */
const Scrub = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.98", "start 0.62"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [16, 0]);

  // Still attach the ref: useScroll warns about a target that never mounts.
  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
};

const Aletheia = () => {
  const openingRef = useRef<HTMLElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(MOVEMENTS[0].id);
  const reduced = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // The rail follows whichever movement is crossing the middle of the screen.
  useEffect(() => {
    const sections = MOVEMENTS.map((m) => document.getElementById(m.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress: openingProgress } = useScroll({
    target: openingRef,
    offset: ["start start", "end start"],
  });
  const markY = useTransform(openingProgress, [0, 1], [0, -140]);
  const markOpacity = useTransform(openingProgress, [0, 0.75], [1, 0]);
  const titleY = useTransform(openingProgress, [0, 1], [0, -60]);
  const titleOpacity = useTransform(openingProgress, [0, 0.7], [1, 0]);

  const { scrollYProgress: articleProgress } = useScroll({
    target: articleRef,
    offset: ["start 0.5", "end 0.9"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Aletheia - Athena Charter"
        description="The Athena Charter: Aletheia, truth revealed through data. Our manifesto on evidence, privacy, service, and innovation with purpose."
        path="/aletheia"
        image="/og/aletheia.png"
        imageAlt="Aletheia: the Athena Data Labs manifesto"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Aletheia: The Athena Charter",
          description:
            "The Athena Charter: Aletheia, truth revealed through data. A manifesto on evidence, privacy, service, and innovation with purpose.",
          url: "https://athenadatalabs.com/aletheia",
          publisher: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
        }}
      />

      {/* The whole charter is one window onto the plane. Scroll drives a slow
          dolly away from the vertex rather than draining the field, so the
          depth holds from the first line to the last. */}
      <AtmosphereField
        watch={["#charter"]}
        intensity={0.62}
        guard="even"
        scrollMode="document"
        revealOn="mount"
      />

      <div id="charter" className="relative z-10">
        {/* ── Opening ─────────────────────────────────────────────────── */}
        <section
          ref={openingRef}
          className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-28"
        >
          {/* ἀλήθεια: literally "unconcealment". The word is uncovered by a wipe
              rather than faded in — the etymology performing itself. */}
          <motion.div
            style={reduced ? undefined : { y: markY, opacity: markOpacity }}
            className="pointer-events-none absolute right-[4%] top-1/2 hidden -translate-y-1/2 select-none md:block"
            aria-hidden="true"
          >
            <motion.p
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.7, delay: 0.35, ease: EASE }}
              lang="grc"
              className="greek-watermark whitespace-nowrap font-display text-[10.5vw] font-light leading-none tracking-[0.01em]"
            >
              ἀλήθεια
            </motion.p>
          </motion.div>

          <motion.div
            style={reduced ? undefined : { y: titleY, opacity: titleOpacity }}
            className="container relative mx-auto max-w-5xl px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/55"
            >
              <span className="h-3 w-[2px] shrink-0 bg-steel" />
              The Athena Charter
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.2, ease: EASE }}
              className="mt-6 font-display text-6xl font-black tracking-[-0.035em] text-foreground sm:text-7xl md:text-8xl"
            >
              Aletheia
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.38, ease: EASE }}
              className="mt-8 max-w-xl border-l border-steel/40 pl-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel/85">
                <span lang="grc">ἀλήθεια</span> · a·lē·thei·a · noun
              </p>
              <p className="mt-3 font-serif text-lg leading-[1.85] text-foreground/85">
                The state of not being hidden. Truth as disclosure: what is
                uncovered when you stop assuming and start measuring.
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
              className="mt-10 font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl"
            >
              Truth revealed through data.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="absolute inset-x-0 bottom-10 hidden justify-center md:flex"
          >
            <span className="flex flex-col items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/55">
              Four movements
              <span className="relative block h-8 w-px overflow-hidden bg-foreground/15">
                <span
                  className="scan-cue absolute inset-x-0 block h-4 bg-steel"
                  style={{ "--scan-duration": "2.1s" } as React.CSSProperties}
                />
              </span>
            </span>
          </motion.div>
        </section>

        {/* ── The charter ─────────────────────────────────────────────── */}
        <div ref={articleRef} className="relative pb-24 md:pb-32">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="relative lg:grid lg:grid-cols-[190px_1fr] lg:gap-14">
              <Rail active={active} progress={articleProgress} />

              {/* ~68 characters: a manifesto is read, not scanned. */}
              <article className="max-w-[38rem]">
                <Movement id="premise" numeral="I" label="Premise">
                  {charterLead.map((paragraph) => (
                    <Scrub key={paragraph}>
                      <p className="font-serif text-lg leading-[2] text-foreground/85">{paragraph}</p>
                    </Scrub>
                  ))}
                </Movement>

                <Movement id="mission" numeral="II" label="Mission & Vision">
                  {charterCore.map((paragraph) => (
                    <Scrub key={paragraph}>
                      <p className="font-serif text-lg leading-[2] text-foreground/85">{paragraph}</p>
                    </Scrub>
                  ))}
                </Movement>

                <Movement id="beliefs" numeral="III" label="We Believe">
                  <ol className="mt-2 divide-y divide-foreground/[0.07] border-y border-foreground/[0.07]">
                    {beliefs.map((belief, index) => (
                      <Scrub key={belief}>
                        <li className="group flex items-baseline gap-5 py-5">
                          <span className="w-6 shrink-0 font-mono text-[10px] tracking-[0.14em] text-steel/55">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-serif text-xl leading-[1.75] text-foreground/85">
                            {belief}
                          </span>
                        </li>
                      </Scrub>
                    ))}
                  </ol>
                </Movement>

                <Movement id="promise" numeral="IV" label="The Promise">
                  {charterClose.map((paragraph) => (
                    <Scrub key={paragraph}>
                      <p className="font-serif text-lg leading-[2] text-foreground/85">{paragraph}</p>
                    </Scrub>
                  ))}

                  <Scrub className="pt-4">
                    <div className="border-l-2 border-steel/50 pl-6">
                      <p className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Truth. Service. Innovation with Purpose.
                      </p>
                      <p className="mt-3 font-serif text-lg leading-[1.9] text-foreground/85">
                        Technology that leaves the world better than we found it.
                      </p>
                      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-steel">
                        Motto: Wisdom through data.
                      </p>
                    </div>
                  </Scrub>
                </Movement>
              </article>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

/** One movement of the charter: a sticky-adjacent marker and its prose. */
const Movement = ({
  id,
  numeral,
  label,
  children,
}: {
  id: string;
  numeral: string;
  label: string;
  children: ReactNode;
}) => (
  <section id={id} className="scroll-mt-28 pt-16 first:pt-4 md:pt-24" aria-label={label}>
    <Scrub className="mb-8">
      <p className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tracking-[0.2em] text-steel">{numeral}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
          {label}
        </span>
      </p>
    </Scrub>
    <div className="space-y-7 md:space-y-8">{children}</div>
  </section>
);

/** Sticky index. Desktop only — on narrow screens it is just noise beside the text. */
const Rail = ({
  active,
  progress,
}: {
  active: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) => {
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  return (
    <nav aria-label="Charter movements" className="hidden lg:block">
      <div className="sticky top-32 pt-4">
        <div className="relative flex gap-5">
          <div className="relative w-px shrink-0 bg-foreground/10">
            <motion.div style={{ scaleY }} className="absolute inset-0 origin-top bg-steel/70" />
          </div>
          <ol className="space-y-5">
            {MOVEMENTS.map((movement) => {
              const isActive = movement.id === active;
              return (
                <li key={movement.id}>
                  <a
                    href={`#${movement.id}`}
                    className={`block text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] transition-colors duration-300 ${
                      isActive ? "text-steel" : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    <span className="mr-2 font-mono tracking-[0.14em]">{movement.numeral}</span>
                    {movement.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
};

export default Aletheia;
