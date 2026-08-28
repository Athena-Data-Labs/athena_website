import { useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { hasFinePointer } from "@/lib/pointer";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Magnetic from "@/components/Magnetic";
import SoundToggle from "@/components/SoundToggle";
import KineticHeadline, { type HeadlineSegment } from "@/components/hero/KineticHeadline";
import { useStageReady } from "@/lib/stage";
import { scrollToSectionById } from "@/lib/scroll";
import { primaryCertification } from "@/content";
import { EASE } from "@/lib/motion";

const HEADLINE: HeadlineSegment[] = [
  { text: "The Systems Companies" },
  { text: "Decide With", accent: true },
];

/** One shape for every entrance in the block, so it reads as a single move. */
const RISE = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const COPY_CLASS = "container relative mx-auto px-6";
const RAIL_CLASS = "absolute inset-x-0 bottom-0 hidden py-5 lg:block";

/**
 * The hero's scroll response: the copy lifts and dissolves a little faster than
 * the page scrolls, so the fixed field behind it is revealed rather than merely
 * uncovered.
 *
 * It lives in its own component so that touch devices can leave it unmounted
 * entirely. The cost is not only the inline transform Framer Motion writes on
 * every scroll frame — `useScroll` also measures the document each frame to
 * produce the progress value, so simply declining to apply the result would
 * still leave the measuring behind. One subscription drives both layers.
 */
const HeroScrollResponse = ({
  target,
  copy,
  rail,
}: {
  target: RefObject<HTMLElement>;
  copy: ReactNode;
  rail: ReactNode;
}) => {
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const railOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);

  return (
    <>
      <motion.div style={{ y: copyY, opacity: copyOpacity }} className={COPY_CLASS}>
        {copy}
      </motion.div>
      <motion.div style={{ opacity: railOpacity }} className={RAIL_CLASS}>
        {rail}
      </motion.div>
    </>
  );
};

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const ready = useStageReady();

  /**
   * The parallax is a cursor-era flourish, and on a phone it is the thing that
   * makes the hero judder.
   *
   * Framer Motion writes this `y` to the element's inline transform from the
   * main thread on every scroll frame, while the page itself is being scrolled
   * by the compositor. At reading speed the per-frame delta is a couple of
   * pixels and a frame of main-thread lag is invisible; in a fling it is 40-80px
   * a frame, and the same one-frame lag becomes the copy visibly jumping against
   * the page. Touch devices get no parallax and scroll in one composited piece.
   */
  const [parallax] = useState(hasFinePointer);

  // Nothing animates until the preloader hands over; `ready` is true immediately
  // on repeat visits and under reduced motion.
  const start = ready ? "animate" : "initial";

  const copy = (
    <>
        <motion.div
          initial="initial"
          animate={start}
          variants={RISE}
          transition={{ duration: 0.85, delay: 0.05, ease: EASE }}
          className="mb-7 flex items-center gap-3"
        >
          <motion.span
            variants={{ initial: { scaleY: 0 }, animate: { scaleY: 1 } }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
            className="h-3.5 w-[2px] shrink-0 origin-bottom bg-steel"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/55">
            Veteran-Owned
            <span className="hidden sm:inline"> · Built, Shipped, and Run by Us</span>
          </p>
        </motion.div>

        <KineticHeadline
          segments={HEADLINE}
          ready={ready}
          className="max-w-6xl font-display text-[2.9rem] leading-[0.98] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[5.4rem]"
        />

        <motion.div
          initial="initial"
          animate={start}
          variants={{ initial: { scaleX: 0 }, animate: { scaleX: 1 } }}
          transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
          className="mb-5 mt-6 h-px w-24 origin-left bg-steel/45"
        />

        <motion.p
          initial="initial"
          animate={start}
          variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.85, delay: 0.6, ease: EASE }}
          className="max-w-2xl text-base leading-[1.72] text-foreground/85 md:text-lg md:leading-[1.78]"
        >
          We build data products end to end: machine-learning applications, forecasting
          systems, and the dashboards a business actually runs on. Shipped to production,
          and answerable for what they do.
        </motion.p>

        <motion.div
          initial="initial"
          animate={start}
          variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.85, delay: 0.72, ease: EASE }}
          className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Magnetic className="w-full sm:w-auto">
            <Button variant="hero" size="lg" className="w-full justify-center sm:w-auto" asChild>
              <a
                href="#contact"
                data-umami-event="hero-talk-to-us"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSectionById("contact");
                }}
              >
                Talk to Us <ArrowRight className="ml-1" size={18} />
              </a>
            </Button>
          </Magnetic>
          <Magnetic strength={0.24} className="w-full sm:w-auto">
            <Button variant="heroOutline" size="lg" className="w-full justify-center sm:w-auto" asChild>
              <a
                href="#services"
                data-umami-event="hero-see-services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSectionById("services");
                }}
              >
                See What We Deliver
              </a>
            </Button>
          </Magnetic>
        </motion.div>

        {/* Small screens keep the proof in flow; desktop pins it to the base rail. */}
        <motion.div
          initial="initial"
          animate={start}
          variants={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-foreground/70 lg:hidden"
        >
          <TrustSignals />
        </motion.div>
    </>
  );

  // Base rail: hairline, scroll cue and proof, aligned to the container grid.
  // Two layers so the scroll fade and the entrance never fight over opacity.
  const rail = (
    <>
      <div className="rule-fade absolute inset-x-0 top-0" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
        className="container mx-auto flex items-center justify-between gap-6 px-6"
      >
        <div className="flex items-center gap-7">
          <ScrollCue />
          <SoundToggle />
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-foreground/70">
          <TrustSignals />
        </div>
      </motion.div>
    </>
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative z-10 flex min-h-[100svh] items-center bg-transparent pb-28 pt-28"
    >
      {parallax ? (
        <HeroScrollResponse target={sectionRef} copy={copy} rail={rail} />
      ) : (
        <>
          <div className={COPY_CLASS}>{copy}</div>
          <div className={RAIL_CLASS}>{rail}</div>
        </>
      )}

      {/* Right-edge marginalia — fills the field's brightest third without competing */}
      <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 xl:block">
        <p className="rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.42em] text-foreground/20">
          Field 001 · Wisdom Through Data
        </p>
      </div>
    </section>
  );
};

const ScrollCue = () => (
  <button
    type="button"
    onClick={() => scrollToSectionById("services")}
    className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40 transition-colors hover:text-foreground/75"
  >
    <span className="relative block h-6 w-px overflow-hidden bg-foreground/15">
      <span className="scan-cue absolute inset-x-0 block h-3 bg-steel" />
    </span>
    Scroll
  </button>
);

const TrustSignals = () => (
  <>
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-steel" />
      Live SaaS in production
    </span>
    <span className="hidden h-3.5 w-px bg-foreground/15 sm:block" />
    <span className="flex items-center gap-1.5">
      <Star size={13} className="fill-primary text-primary" />
      5.0 on the App Store
    </span>
    <span className="hidden h-3.5 w-px bg-foreground/15 sm:block" />
    {/* "Engineered on AWS" was true of everyone. A decade inside DoD program
        analysis is true of almost nobody, and it names the segment we serve. */}
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-steel" />
      10 years supporting DoD programs
    </span>
    <span className="hidden h-3.5 w-px bg-foreground/15 sm:block" />
    {/* The only line here a reader can check against a federal register rather
        than take our word for. */}
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-steel" />
      {primaryCertification.abbr} · SBA-certified
    </span>
  </>
);

export default HeroSection;
