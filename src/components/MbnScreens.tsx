import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import mbn1 from "@/assets/mbn/mbn-1.webp";
import mbn2 from "@/assets/mbn/mbn-2.webp";
import mbn3 from "@/assets/mbn/mbn-3.webp";
import mbn4 from "@/assets/mbn/mbn-4.webp";
import mbn5 from "@/assets/mbn/mbn-5.webp";
import mbn6 from "@/assets/mbn/mbn-6.webp";

/**
 * The App Store listing itself: the six screenshots Apple shows, plus the
 * preview video, in the order the listing runs them.
 *
 * Keeping our order the same as the App Store's is deliberate. A visitor who
 * follows the badge should land on something they recognize, and the sequence
 * was already argued over once — private, then categorize, forecast, flag,
 * trace, total. Re-cutting it here would only mean arguing about it twice.
 *
 * Regenerate from
 * Documents/Athena-Analytics-LLC/11_Products/MyBudgetNerd/Assets/iOS.
 */
const PREVIEW = {
  poster: "/mbn-preview.webp",
  source: "/mbn-preview.mp4",
  length: "23s",
} as const;

const slides = [
  { label: "Home", src: mbn1 },
  { label: "Categorization", src: mbn2 },
  { label: "Forecast", src: mbn3 },
  { label: "Anomalies", src: mbn4 },
  { label: "Flow map", src: mbn5 },
  { label: "Overview", src: mbn6 },
];

const ROTATE_MS = 4200;

/** Auto-rotating gallery of the MyBudgetNerd App Store listing (cross-fade) with manual prev/next. */
const MbnScreens = () => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Bumped on every manual navigation so the auto-rotate timer restarts from zero
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  // The lightbox holds the rotation as firmly as a hover does: coming back to a
  // different screen than the one you opened is disorienting.
  useEffect(() => {
    if (paused || expanded) return;
    const t = window.setInterval(() => setI((p) => (p + 1) % slides.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, expanded, nonce]);

  const goTo = (idx: number) => {
    setI(((idx % slides.length) + slides.length) % slides.length);
    setNonce((n) => n + 1);
  };

  const expand = () => {
    setExpanded(true);
    window.umami?.track("mbn-preview-expand");
  };

  const slide = slides[i];

  const arrowClasses =
    "pointer-events-auto flex h-9 w-9 items-center justify-center border border-foreground/15 bg-background/75 text-foreground/70 transition-colors hover:border-steel/50 hover:text-steel focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/60";

  return (
    <div
      className="flex w-full flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Screen frame — fixed phone aspect, cross-fade between slides */}
      <div
        className="relative mx-auto w-full max-w-[270px] overflow-hidden border border-foreground/[0.08] bg-surface"
        style={{ aspectRatio: "1284 / 2778" }}
      >
        <AnimatePresence>
          <motion.img
            key={i}
            src={slide.src}
            alt={`MyBudgetNerd · ${slide.label}`}
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
          src={slides[(i + 1) % slides.length].src}
          alt=""
          aria-hidden="true"
          decoding="async"
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
        {slides.map((s, idx) => (
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
                idx === i ? "w-6 bg-primary" : "w-1.5 bg-foreground/20 group-hover/dot:bg-foreground/50"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {slide.label}
      </p>

      {/* The preview sits under the gallery rather than inside it. It is a screen
          recording; those six are captioned App Store canvases. Dropping raw
          footage into the same rotation read as a slide somebody forgot to
          finish, and the fix is not to dress the video up to match. */}
      <button
        type="button"
        onClick={expand}
        className="group/play mx-auto mt-4 flex items-center gap-2 border border-foreground/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:border-steel/50 hover:text-steel focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary/60"
      >
        <Play size={10} className="fill-current text-primary" aria-hidden="true" />
        Play the preview · {PREVIEW.length}
      </button>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="w-[92vw] max-w-sm border-foreground/[0.12] bg-surface p-4 [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!shadow-none [&>button]:!ring-0 [&>button]:!ring-offset-0 [&>button]:!outline-none [&>button]:hover:!bg-foreground/[0.04] [&>button]:focus:!ring-0 [&>button]:focus:!ring-offset-0">
          <div className="space-y-3">
            <DialogTitle className="font-display text-base text-foreground">
              MyBudgetNerd · App Store preview
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              The {PREVIEW.length} preview from the listing: Oracle&rsquo;s next-month call, the
              categorized statement, the financial story, and the funds flow map.
            </DialogDescription>

            {/* Portrait footage, so the height is the constraint and the width
                follows it. Sizing it the other way round — full width, capped
                height — cropped the bottom of the phone off. */}
            <div className="flex justify-center overflow-hidden border border-foreground/[0.08] bg-background">
              <video
                className="block max-h-[70vh] w-auto max-w-full"
                autoPlay={!reduced}
                muted
                playsInline
                loop
                controls
                preload="metadata"
                poster={PREVIEW.poster}
                aria-label="MyBudgetNerd App Store preview"
              >
                <source src={PREVIEW.source} type="video/mp4" />
              </video>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MbnScreens;
