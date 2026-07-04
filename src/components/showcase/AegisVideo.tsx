import { useEffect, useRef, useState } from "react";
import { Lock, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const clips = [
  {
    id: "upload-mapping",
    step: "01",
    title: "Upload & Column Mapping",
    description: "Import a spreadsheet and map fields into the Aegis data model.",
    source: "/aegis-upload-mapping.mp4",
    poster: "/aegis-upload-mapping-poster.jpg",
  },
  {
    id: "tabs-walkthrough",
    step: "02",
    title: "Command Center Walkthrough",
    description: "Move across the full command center and review each core tab.",
    source: "/aegis-tabs-walkthrough.mp4",
    poster: "/aegis-tabs-walkthrough-poster.jpg",
  },
  {
    id: "ai-graphs",
    step: "03",
    title: "Glaukos: Analysis & Charts",
    description: "Ask Glaukos to run analysis and generate charts from your live numbers.",
    source: "/aegis-ai-graphs.mp4",
    poster: "/aegis-ai-graphs-poster.jpg",
  },
] as const;

/**
 * One clip in the walkthrough grid. Playback is viewport-aware: the video only
 * plays while on screen (and never autoplays for reduced-motion visitors), so
 * three loops don't decode simultaneously off-screen.
 */
const ClipCard = ({
  clip,
  reduced,
  onExpand,
}: {
  clip: (typeof clips)[number];
  reduced: boolean;
  onExpand: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <figure className="group flex h-full flex-col overflow-hidden border border-white/[0.08] bg-[hsl(213,34%,9%)] transition-colors hover:border-primary/25">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto hidden items-center gap-1.5 bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
          <Lock size={10} className="text-primary/60" /> aegis.athenadatalabs.com
        </span>
        <Maximize2 size={12} className="ml-auto text-white/25 transition-colors group-hover:text-primary/70 sm:ml-0" aria-hidden="true" />
      </div>

      <button
        type="button"
        className="block w-full cursor-zoom-in text-left focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary/60"
        onClick={onExpand}
        aria-label={`Expand Aegis clip: ${clip.title}`}
      >
        <video
          ref={videoRef}
          className="block aspect-[1440/926] w-full bg-[#0a0c10]"
          muted
          playsInline
          loop
          controls={reduced}
          preload="none"
          poster={clip.poster}
          aria-label={`Aegis BI clip: ${clip.title}`}
          disablePictureInPicture
        >
          <source src={clip.source} type="video/mp4" />
        </video>
      </button>

      <figcaption className="flex flex-1 flex-col border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <p className="flex items-baseline gap-2.5">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/30">{clip.step}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            {clip.title}
          </span>
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{clip.description}</p>
      </figcaption>
    </figure>
  );
};

/**
 * Real Aegis BI product footage as a three-step walkthrough matching the
 * product's core loop: upload, explore, ask. Click any clip for a lightbox.
 */
const AegisVideo = () => {
  const [reduced, setReduced] = useState(false);
  const [expandedClipId, setExpandedClipId] = useState<string | null>(null);

  const expandedClip = clips.find((clip) => clip.id === expandedClipId) ?? null;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => setReduced(mediaQuery.matches);

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);
    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  const expand = (id: string) => {
    setExpandedClipId(id);
    window.umami?.track("aegis-clip-expand", { clip: id });
  };

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-3">
        {clips.map((clip) => (
          <ClipCard key={clip.id} clip={clip} reduced={reduced} onExpand={() => expand(clip.id)} />
        ))}
      </div>

      <Dialog
        open={Boolean(expandedClip)}
        onOpenChange={(open) => {
          if (!open) setExpandedClipId(null);
        }}
      >
        <DialogContent className="w-[96vw] max-w-6xl border-white/[0.12] bg-[hsl(213,34%,9%)] p-4 sm:p-5 [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!shadow-none [&>button]:!ring-0 [&>button]:!ring-offset-0 [&>button]:!outline-none [&>button]:hover:!bg-white/[0.04] [&>button]:focus:!ring-0 [&>button]:focus:!ring-offset-0">
          {expandedClip && (
            <div className="space-y-3">
              <DialogTitle className="flex items-baseline gap-3 font-display text-base text-foreground sm:text-lg">
                <span className="font-mono text-xs tracking-[0.16em] text-white/30">{expandedClip.step}</span>
                {expandedClip.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {expandedClip.description}
              </DialogDescription>

              <div className="overflow-hidden border border-white/[0.08] bg-[#0a0c10]">
                <video
                  className="block h-auto max-h-[72vh] w-full object-contain"
                  autoPlay={!reduced}
                  muted
                  playsInline
                  loop
                  controls
                  preload="metadata"
                  poster={expandedClip.poster}
                  aria-label={`Expanded Aegis BI clip: ${expandedClip.title}`}
                >
                  <source src={expandedClip.source} type="video/mp4" />
                </video>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AegisVideo;
