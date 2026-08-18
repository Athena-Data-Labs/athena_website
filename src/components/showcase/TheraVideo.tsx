import { useEffect, useRef, useState } from "react";
import { Lock, Maximize2, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Real Thera footage, recorded against a fictional contractor.
 *
 * Every clip and still here is Ridgeline Site Works, a company that does not
 * exist, scored against the genuine SAM.gov notices in the development
 * database. That is the whole reason this page can finally show screens: the
 * constraint was never access, it was whose pipeline was on them.
 *
 * Two themes ship for every asset and CSS picks one, on the same `dark` class
 * next-themes writes to <html>. Reading `resolvedTheme` instead would mean
 * rendering the wrong variant during the prerendered first paint and swapping
 * it after hydration — a flicker, and a wasted download of a video nobody sees.
 *
 * Nothing autoplays from markup. `display: none` hides an element; it does not
 * stop it downloading, so `preload="none"` plus a script-started `play()` is
 * what keeps a visitor from pulling both themes of a 4MB clip to watch one —
 * and keeps someone who asked for no motion from pulling any of it.
 */
const clips = [
  {
    id: "capture",
    step: "01",
    title: "Find it, score it, bid it",
    description:
      "Mission Control, then 432 live notices ranked against the company profile. Opening one shows the score broken into seven weighted factors, and the workspace behind it carries the checklist, the market bid range, and the drafting panel.",
    stem: "thera-capture",
    length: "22s",
  },
  {
    id: "network",
    step: "02",
    title: "Find the team",
    description:
      "Partners ranked for one specific notice, new firms surfaced out of public federal award data, the two-way network listing, and the Digital Twin every one of those matches is made against.",
    stem: "thera-network",
    length: "23s",
  },
  {
    id: "tour",
    step: "03",
    title: "The full tour",
    description:
      "Both halves end to end, at the pace of someone actually working: discovery through to a bid package, and the teaming that goes with it.",
    stem: "thera-tour",
    length: "46s",
  },
] as const;

type Clip = (typeof clips)[number];

/** One clip, in both themes, with only the visible one ever playing. */
const ThemedVideo = ({
  stem,
  label,
  className,
  reduced,
  inDialog = false,
}: {
  stem: string;
  label: string;
  className: string;
  reduced: boolean;
  inDialog?: boolean;
}) => {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = host.current;
    if (!root) return;

    const sync = (visible: boolean) => {
      for (const video of root.querySelectorAll("video")) {
        // checkVisibility answers for the wrapper CSS actually hid, which is
        // not the element carrying the class.
        if (visible && !reduced && video.checkVisibility()) {
          void video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      }
    };

    // Only the lightbox plays. Autoplaying the three cards on scroll — the
    // pattern the Aegis walkthrough uses — was measured at 19.5MB for this
    // page, because these clips are 4.4, 4.9 and 9.4MB rather than a few
    // hundred kilobytes: every visitor who scrolled past downloaded all three
    // to watch none of them. The cards are posters until somebody asks.
    const themed = new MutationObserver(() => sync(inDialog));
    themed.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    sync(inDialog);
    return () => themed.disconnect();
  }, [reduced, inDialog]);

  return (
    <div ref={host}>
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} className={theme === "dark" ? "hidden dark:block" : "dark:hidden"}>
          {/* muted + playsInline are what make a script-started clip legal on
              iOS and in Chrome; without both, play() is refused and the poster
              is all anyone ever sees. */}
          <video
            className={className}
            muted
            playsInline
            loop
            controls={reduced || inDialog}
            preload="none"
            poster={`/${stem}-${theme}.webp`}
            aria-label={label}
            disablePictureInPicture
          >
            <source src={`/${stem}-${theme}.mp4`} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  );
};

const ClipCard = ({ clip, reduced, onExpand }: { clip: Clip; reduced: boolean; onExpand: () => void }) => (
  <figure className="group flex h-full flex-col overflow-hidden border border-foreground/[0.08] bg-surface transition-colors hover:border-steel/25">
    <div className="flex items-center gap-3 border-b border-foreground/[0.06] bg-foreground/[0.02] px-4 py-2">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-foreground/15" />
        <span className="h-2 w-2 rounded-full bg-foreground/15" />
        <span className="h-2 w-2 rounded-full bg-foreground/15" />
      </span>
      <span className="mx-auto hidden items-center gap-1.5 bg-foreground/[0.04] px-2.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
        <Lock size={10} className="text-steel/60" /> thera.athenadatalabs.com
      </span>
      <Maximize2 size={12} className="ml-auto text-foreground/25 transition-colors group-hover:text-steel/70 sm:ml-0" aria-hidden="true" />
    </div>

    <button
      type="button"
      className="block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary/60"
      onClick={onExpand}
      aria-label={`Expand Thera clip: ${clip.title}`}
    >
      {/* 8:5 is the recording's own aspect, so nothing is cropped. */}
      <span className="relative block">
        <ThemedVideo
          stem={clip.stem}
          label={`Thera clip: ${clip.title}`}
          className="block aspect-[8/5] w-full bg-background"
          reduced={reduced}
        />
        {/* The card is a still until it is asked for, so it has to say so —
            a poster with no affordance reads as a screenshot, or as a video
            that failed. */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-2 border border-background/20 bg-background/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm backdrop-blur-sm transition-colors group-hover:border-steel/40 group-hover:text-steel">
            <Play size={11} className="fill-current" aria-hidden="true" />
            Play · {clip.length}
          </span>
        </span>
      </span>
    </button>

    <figcaption className="flex flex-1 flex-col border-t border-foreground/[0.06] bg-foreground/[0.02] px-4 py-3">
      <p className="flex items-baseline gap-2.5">
        <span className="font-mono text-[10px] tracking-[0.16em] text-foreground/30">{clip.step}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70">{clip.title}</span>
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{clip.description}</p>
    </figcaption>
  </figure>
);

const TheraVideo = () => {
  const [reduced, setReduced] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expanded = clips.find((c) => c.id === expandedId) ?? null;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const expand = (id: string) => {
    setExpandedId(id);
    window.umami?.track("thera-clip-expand", { clip: id });
  };

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-3">
        {clips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} reduced={reduced} onExpand={() => expand(clip.id)} />
        ))}
      </div>

      <Dialog open={Boolean(expanded)} onOpenChange={(open) => { if (!open) setExpandedId(null); }}>
        <DialogContent className="w-[96vw] max-w-6xl border-foreground/[0.12] bg-surface p-4 sm:p-5 [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!shadow-none [&>button]:!ring-0 [&>button]:!ring-offset-0 [&>button]:!outline-none [&>button]:hover:!bg-foreground/[0.04] [&>button]:focus:!ring-0 [&>button]:focus:!ring-offset-0">
          {expanded && (
            <div className="space-y-3">
              <DialogTitle className="flex items-baseline gap-3 font-display text-base text-foreground sm:text-lg">
                <span className="font-mono text-xs tracking-[0.16em] text-foreground/30">{expanded.step}</span>
                {expanded.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{expanded.description}</DialogDescription>
              <div className="overflow-hidden border border-foreground/[0.08] bg-background">
                <ThemedVideo
                  key={expanded.id}
                  stem={expanded.stem}
                  label={`Expanded Thera clip: ${expanded.title}`}
                  className="block h-auto max-h-[72vh] w-full object-contain"
                  reduced={reduced}
                  inDialog
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TheraVideo;
