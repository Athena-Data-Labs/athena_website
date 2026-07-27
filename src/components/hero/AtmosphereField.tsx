import { useEffect, useRef, useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import { subscribePointer } from "@/lib/pointer";
import { useStageReady } from "@/lib/stage";

type Props = {
  /** Sections that are transparent windows onto this plane. Off-screen → throttled. */
  watch?: string[];
  /** Page-level exposure. The hero runs at 1; pages you have to read sit further back. */
  intensity?: number;
  /**
   * "left" holds back the left third for a left-aligned headline. "even" dims
   * uniformly — the right choice wherever the copy is centred.
   */
  guard?: "left" | "even";
  /**
   * "hero" drains the field over the first viewport. "document" maps the whole
   * page to a slow dolly through the lattice, so a long read keeps its depth.
   */
  scrollMode?: "hero" | "document";
  /**
   * "stage" waits for the homepage preloader to hand over. Every other page
   * mounts without one, so it opens the aperture itself.
   */
  revealOn?: "stage" | "mount";
};

/**
 * A page's deepest layer: a fixed, full-viewport WebGL plane that transparent
 * sections are cut out of. Never scrolls — opaque sections slide over it, which
 * is what gives a page its sense of depth without a single box-shadow.
 *
 * Falls back to a static CSS composition when WebGL2 is missing.
 */
const AtmosphereField = ({
  watch = [],
  intensity = 1,
  guard = "left",
  scrollMode = "hero",
  revealOn = "stage",
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const ready = useStageReady();
  const rendererRef = useRef<FieldRenderer | null>(null);
  // Depend on the contents, not the array identity, so an inline literal from
  // the caller can never tear down and rebuild the GL context.
  const watchKey = watch.join(",");

  useEffect(() => {
    const selectors = watchKey ? watchKey.split(",") : [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: FieldRenderer;
    try {
      renderer = new FieldRenderer(canvas);
    } catch {
      setFailed(true);
      return;
    }
    rendererRef.current = renderer;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const narrowQuery = window.matchMedia("(max-width: 1023px)");

    const applyPreferences = () => {
      renderer.reducedMotion = motionQuery.matches;
      // On phones the copy sits over the middle of the plane, so the left-hand
      // guard that protects the desktop headline would dim the wrong third.
      renderer.copyGuard = guard === "left" && !narrowQuery.matches ? 1 : 0;
      renderer.traceIntensity = (narrowQuery.matches ? 0.45 : 1) * intensity;
      renderer.intensity = intensity;
      // A page you have to read keeps its depth all the way down; the hero
      // hands the screen over to the sections below it.
      renderer.scrollDim = scrollMode === "document" ? 0.22 : 1;
      renderer.setMobileProfile(coarseQuery.matches || narrowQuery.matches);
    };

    // Scrolling a phone collapses the URL bar, which fires `resize` with a new
    // height and an unchanged width — repeatedly, mid-scroll. Each call
    // reallocates five GPU render targets, which is the single biggest source
    // of scroll stutter on mobile. So on touch devices the backing store is
    // sized to the tallest viewport seen and height-only changes are ignored;
    // only a width change (a real rotation) re-allocates.
    let lastWidth = 0;
    let tallest = 0;
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const coarse = coarseQuery.matches;

      if (coarse) {
        if (width !== lastWidth) tallest = height;
        else if (height <= tallest) return;
        else tallest = height;
      }
      lastWidth = width;

      // Cap DPR harder on phones: the march is fill-rate bound, not geometry bound.
      const cap = coarse ? 1.5 : 2;
      renderer.resize(width, coarse ? tallest : height, Math.min(window.devicePixelRatio || 1, cap));
    };

    applyPreferences();
    resize();
    renderer.start();

    const unsubscribePointer = subscribePointer((x, y) => {
      const nx = (x / window.innerWidth) * 2 - 1;
      const ny = -((y / window.innerHeight) * 2 - 1);
      renderer.setPointer(nx, ny, x / window.innerWidth, 1 - y / window.innerHeight);
    });

    let scrollFrame = 0;
    let scrollIdle = 0;
    const onScroll = () => {
      // Hand the GPU back to the compositor for the length of a flick.
      if (coarseQuery.matches) {
        renderer.scrollBusy = true;
        window.clearTimeout(scrollIdle);
        scrollIdle = window.setTimeout(() => {
          renderer.scrollBusy = false;
        }, 160);
      }
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const span =
          scrollMode === "document"
            ? document.documentElement.scrollHeight - window.innerHeight
            : window.innerHeight * 0.9;
        renderer.setScroll(Math.min(1, window.scrollY / Math.max(1, span)));
      });
    };

    const onVisibility = () => {
      if (document.hidden) renderer.stop();
      else renderer.start();
    };

    // Once every window onto the plane has left the viewport, drop to a trickle.
    const targets = selectors
      .map((selector) => document.querySelector(selector))
      .filter((el): el is Element => Boolean(el));
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        renderer.throttled = visible.size === 0;
      },
      { threshold: 0 },
    );
    for (const target of targets) observer.observe(target);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", applyPreferences);
    narrowQuery.addEventListener("change", applyPreferences);
    coarseQuery.addEventListener("change", applyPreferences);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(scrollFrame);
      window.clearTimeout(scrollIdle);
      observer.disconnect();
      unsubscribePointer();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", applyPreferences);
      narrowQuery.removeEventListener("change", applyPreferences);
      coarseQuery.removeEventListener("change", applyPreferences);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [watchKey, intensity, guard, scrollMode]);

  useEffect(() => {
    if (ready || revealOn === "mount") rendererRef.current?.reveal();
  }, [ready, revealOn]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#0a0c10]" aria-hidden="true">
      {failed ? (
        <StaticFallback />
      ) : (
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ opacity: 0.999 }} /* forces its own layer, avoids repaint of the copy above */
        />
      )}
    </div>
  );
};

/** No WebGL2: keep the same light logic in pure CSS rather than showing a void. */
const StaticFallback = () => (
  <div className="absolute inset-0">
    <div className="absolute left-1/2 top-0 h-[520px] w-[140vw] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(40_75%_60%/0.10),transparent_70%)]" />
    <div className="absolute right-[-10%] top-1/4 h-[70vh] w-[70vw] bg-[radial-gradient(ellipse_at_center,hsl(40_75%_60%/0.07),transparent_65%)]" />
    <div className="absolute inset-0 bg-dot-grid-primary opacity-40" />
  </div>
);

export default AtmosphereField;
