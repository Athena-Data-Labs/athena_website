import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import mbn1 from "@/assets/mbn/mbn-1.webp";
import mbn2 from "@/assets/mbn/mbn-2.webp";
import mbn3 from "@/assets/mbn/mbn-3.webp";
import mbn4 from "@/assets/mbn/mbn-4.webp";
import mbn5 from "@/assets/mbn/mbn-5.webp";
import mbn6 from "@/assets/mbn/mbn-6.webp";
import mbn7 from "@/assets/mbn/mbn-7.webp";

const screens = [
  { src: mbn1, label: "Insights" },
  { src: mbn2, label: "Overview" },
  { src: mbn3, label: "Trends" },
  { src: mbn4, label: "Flow map" },
  { src: mbn5, label: "Categorization" },
  { src: mbn6, label: "Forecast" },
  { src: mbn7, label: "Anomalies" },
];

const ROTATE_MS = 4200;

/** Auto-rotating gallery of MyBudgetNerd App Store screens (cross-fade) with manual prev/next. */
const MbnScreens = () => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Bumped on every manual navigation so the auto-rotate timer restarts from zero
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % screens.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, nonce]);

  const goTo = (idx: number) => {
    setI(((idx % screens.length) + screens.length) % screens.length);
    setNonce((n) => n + 1);
  };

  const arrowClasses =
    "pointer-events-auto flex h-9 w-9 items-center justify-center border border-white/15 bg-[#0a0c10]/75 text-white/70 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/60";

  return (
    <div
      className="flex w-full flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Screen frame — fixed phone aspect, cross-fade between screens */}
      <div className="relative mx-auto w-full max-w-[270px] overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,8%)]" style={{ aspectRatio: "1242 / 2688" }}>
        <AnimatePresence>
          <motion.img
            key={i}
            src={screens[i].src}
            alt={`MyBudgetNerd — ${screens[i].label}`}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            loading="lazy"
            draggable={false}
          />
        </AnimatePresence>
        {/* Preload the next frame so the cross-fade never waits on the network */}
        <img
          src={screens[(i + 1) % screens.length].src}
          alt=""
          aria-hidden="true"
          className="hidden"
        />

        {/* Prev / next — flat utility controls overlaid at the frame edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-2">
          <button type="button" aria-label="Previous screen" onClick={() => goTo(i - 1)} className={arrowClasses}>
            <ChevronLeft size={17} />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center pr-2">
          <button type="button" aria-label="Next screen" onClick={() => goTo(i + 1)} className={arrowClasses}>
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Indicators — same look, taller invisible hit area so they're easy to click */}
      <div className="mt-3 flex items-center justify-center">
        {screens.map((s, idx) => (
          <button
            key={s.label}
            type="button"
            aria-label={`Show ${s.label}`}
            aria-current={idx === i}
            onClick={() => goTo(idx)}
            className="group/dot flex h-8 items-center px-1"
          >
            <span
              className={`h-1.5 transition-all duration-300 ${
                idx === i ? "w-6 bg-primary" : "w-1.5 bg-white/20 group-hover/dot:bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {screens[i].label}
      </p>
    </div>
  );
};

export default MbnScreens;
