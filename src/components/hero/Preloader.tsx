import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { introAlreadyPlayed, markIntroPlayed, markStageReady } from "@/lib/stage";

const STAGES = ["Initialising field", "Compiling shaders", "Linking signals", "Ready"];

/**
 * First-visit boot sequence. It closes to a horizontal slit and hands off to the
 * WebGL aperture, which opens from that same slit — one continuous gesture
 * rather than a loader that vanishes.
 *
 * Shown once per tab, skipped entirely under reduced motion: it is a
 * first-impression device, not a toll booth.
 */
const Preloader = () => {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return false;
    if (introAlreadyPlayed()) return false;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const counterRef = useRef<HTMLSpanElement>(null);
  const [stage, setStage] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!active) {
      markStageReady();
      return;
    }

    markIntroPlayed();
    let cancelled = false;

    // Hold the page still while the curtain is up — otherwise a stray scroll
    // lands you halfway down the page as the hero is revealed.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let resolveCount: () => void = () => {};
    const counted = new Promise<void>((resolve) => {
      resolveCount = resolve;
    });

    const controls = animate(0, 100, {
      duration: 1.05,
      ease: [0.22, 0.9, 0.24, 1],
      onUpdate: (value) => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(value)).padStart(3, "0");
        }
        setStage(Math.min(STAGES.length - 1, Math.floor((value / 100) * STAGES.length)));
      },
      onComplete: resolveCount,
    });

    // Don't reveal into a flash of fallback type.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const settled = Promise.all([
      counted,
      Promise.race([fonts, new Promise((r) => window.setTimeout(r, 1400))]),
    ]);

    settled.then(() => {
      if (cancelled) return;
      setClosing(true);
      // The field starts opening behind the slit, so the two motions overlap.
      window.setTimeout(() => !cancelled && markStageReady(), 260);
      window.setTimeout(() => {
        if (cancelled) return;
        document.body.style.overflow = previousOverflow;
        setActive(false);
      }, 900);
    });

    return () => {
      cancelled = true;
      controls.stop();
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] bg-[#0a0c10]"
          initial={{ clipPath: "inset(0% 0 0% 0)" }}
          animate={{ clipPath: closing ? "inset(50% 0 50% 0)" : "inset(0% 0 0% 0)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* The one warm light source, same as the field behind it */}
          <div className="absolute left-1/2 top-0 h-[420px] w-[140vw] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(40_75%_60%/0.08),transparent_70%)]" />

          <motion.div
            animate={{ opacity: closing ? 0 : 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col justify-between px-6 py-8 md:px-10 md:py-10"
          >
            <div className="flex items-baseline gap-3">
              <span className="h-3 w-[2px] bg-steel" />
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                Athena Data Labs
              </span>
            </div>

            <div className="mx-auto w-full max-w-md">
              <div className="mb-3 flex items-end justify-between">
                <motion.span
                  key={stage}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45"
                >
                  {STAGES[stage]}
                </motion.span>
                <span
                  ref={counterRef}
                  className="font-display text-[11px] font-medium tabular-nums tracking-[0.2em] text-steel"
                >
                  000
                </span>
              </div>
              <div className="relative h-px w-full bg-white/10">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.05, ease: [0.22, 0.9, 0.24, 1] }}
                  className="absolute inset-0 origin-left bg-primary"
                />
              </div>
            </div>

            <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-white/25">
              <span>Wisdom through data</span>
              <span>Est. 2026</span>
            </div>
          </motion.div>

          {/* The seam the field opens from */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.2 }}
            animate={{ opacity: closing ? 1 : 0, scaleX: closing ? 1 : 0.2 }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
