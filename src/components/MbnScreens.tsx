import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import mbn1 from "@/assets/mbn/mbn-1.png";
import mbn2 from "@/assets/mbn/mbn-2.png";
import mbn3 from "@/assets/mbn/mbn-3.png";
import mbn4 from "@/assets/mbn/mbn-4.png";
import mbn5 from "@/assets/mbn/mbn-5.png";
import mbn6 from "@/assets/mbn/mbn-6.png";
import mbn7 from "@/assets/mbn/mbn-7.png";

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

/** Auto-rotating gallery of MyBudgetNerd App Store screens (cross-fade). */
const MbnScreens = () => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % screens.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused]);

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
      </div>

      {/* Indicators */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {screens.map((s, idx) => (
          <button
            key={s.label}
            type="button"
            aria-label={`Show ${s.label}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-1.5 transition-all duration-300 ${
              idx === i ? "w-6 bg-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {screens[i].label}
      </p>
    </div>
  );
};

export default MbnScreens;
