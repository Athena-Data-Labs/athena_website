import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const clips = [
  {
    id: "upload-mapping",
    title: "Upload + Column Mapping",
    description: "Import a spreadsheet and map fields into the Aegis data model.",
    source: "/aegis-upload-mapping.mp4",
    poster: "/aegis-upload-mapping-poster.jpg",
  },
  {
    id: "tabs-walkthrough",
    title: "Tabs Walkthrough",
    description: "Move across the full command center and review each core tab.",
    source: "/aegis-tabs-walkthrough.mp4",
    poster: "/aegis-tabs-walkthrough-poster.jpg",
  },
  {
    id: "ai-graphs",
    title: "AI + Graph Generation",
    description: "Use Glaukos to run analysis and generate visual narratives.",
    source: "/aegis-ai-graphs.mp4",
    poster: "/aegis-ai-graphs-poster.jpg",
  },
] as const;

/**
 * Real Aegis BI product footage broken into focused clips.
 * Clips autoplay muted and loop in their own time ranges; visitors who
 * prefer reduced motion get native controls and no autoplay.
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

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  return (
    <>
      <div className="grid gap-3 xl:grid-cols-2">
        {clips.map((clip, index) => (
          <figure
            key={clip.id}
            className={`overflow-hidden border border-white/[0.08] bg-[hsl(213,34%,9%)] transition-colors hover:border-primary/20 ${index === 2 ? "xl:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
              </span>
              <span className="mx-auto inline-flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 text-[10px] text-muted-foreground">
                <Lock size={10} className="text-primary/60" /> aegis.athenadatalabs.com
              </span>
            </div>

            <button
              type="button"
              className="block w-full cursor-zoom-in text-left transition-opacity hover:opacity-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0"
              onClick={() => setExpandedClipId(clip.id)}
              aria-label={`Expand Aegis clip: ${clip.title}`}
            >
              <div className="overflow-hidden bg-[#0a0c10]">
                <video
                  className="block aspect-[1440/926] w-full bg-[#0a0c10]"
                  autoPlay={!reduced}
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
              </div>
            </button>

            <figcaption className="border-t border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
                {clip.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground/90">{clip.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <Dialog
        open={Boolean(expandedClip)}
        onOpenChange={(open) => {
          if (!open) {
            setExpandedClipId(null);
          }
        }}
      >
        <DialogContent className="w-[98vw] max-h-[92vh] max-w-7xl overflow-y-auto border-white/[0.12] bg-[hsl(213,34%,9%)] p-3 sm:p-4 md:p-5 [&>button]:!border-0 [&>button]:!bg-transparent [&>button]:!shadow-none [&>button]:!ring-0 [&>button]:!ring-offset-0 [&>button]:!outline-none [&>button]:hover:!bg-white/[0.04] [&>button]:focus:!ring-0 [&>button]:focus:!ring-offset-0">
          {expandedClip && (
            <div className="space-y-3">
              <DialogTitle className="font-display text-base text-foreground sm:text-lg">
                {expandedClip.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground sm:text-sm">
                {expandedClip.description}
              </DialogDescription>

              <div className="overflow-hidden border border-white/[0.08] bg-[#0a0c10]">
                <video
                  className="block h-auto max-h-[70vh] w-full object-contain"
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
