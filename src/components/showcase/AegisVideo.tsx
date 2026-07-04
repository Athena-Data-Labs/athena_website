import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

/**
 * Real Aegis BI product footage in a flat browser-window frame.
 * Autoplays muted and loops (standard product-demo pattern); for visitors who
 * prefer reduced motion it stays on the poster with native controls so they can
 * play it on demand.
 */
const AegisVideo = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <figure className="overflow-hidden border border-white/[0.08] bg-[hsl(213,34%,9%)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto inline-flex items-center gap-1.5 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground">
          <Lock size={11} className="text-primary/60" /> aegis.athenadatalabs.com
        </span>
      </div>

      <video
        className="block aspect-[1440/926] w-full bg-[#0a0c10]"
        autoPlay={!reduced}
        muted
        loop
        playsInline
        controls={reduced}
        preload="metadata"
        poster="/aegis-poster.webp"
        aria-label="Aegis BI — live walkthrough of the Command Center and the Glaukos AI analyst"
      >
        <source src="/aegis-demo.mp4" type="video/mp4" />
      </video>

      <figcaption className="flex items-center justify-center gap-2 border-t border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" /> Real product · recorded live
      </figcaption>
    </figure>
  );
};

export default AegisVideo;
