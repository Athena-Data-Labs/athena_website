import { useEffect, useRef, useState } from "react";
import { FieldRenderer } from "./FieldRenderer";
import { readHslToken } from "@/lib/css-color";
import { subscribePointer } from "@/lib/pointer";
import { useStageReady } from "@/lib/stage";

type Props = {
  /** Sections that are transparent windows onto this plane. Off-screen → throttled. */
  watch?: string[];
  /** Page-level exposure. The hero runs at 1; pages you have to read sit further back. */
  intensity?: number;
  /**
   * "left" holds back the left third for a left-aligned headline. "even" dims
   * uniformly — the right choice wherever the copy is centered.
   */
  guard?: "left" | "even";
  /**
   * "hero" drains the field over the first viewport. "document" maps the whole
   * page to a slow dolly away from the vertex, so a long read keeps its depth.
   */
  scrollMode?: "hero" | "document";
  /**
   * "stage" waits for the homepage preloader to hand over. Every other page
   * mounts without one, so it opens the aperture itself.
   */
  revealOn?: "stage" | "mount";
};

/**
 * Point the composite at whichever theme is currently live.
 *
 * The palette is read straight back out of index.css rather than restated here —
 * the theme owns the colours, and a second copy in a TS file is the one that
 * goes stale. The field has its own two tokens rather than borrowing the ones
 * the document uses: --field-warm and --field-cool answer to a particle
 * collision, not to body text, and they are allowed to be much louder.
 *
 * Which theme is live is decided from the page's own --background rather than
 * from the theme library's state, for the same reason. The background is what
 * the plane has to sit on; if it is light, the plane lays ink, whatever anyone
 * else believes about the current theme.
 */
const applyPalette = (renderer: FieldRenderer) => {
  const paper = readHslToken("--background", [0.039, 0.047, 0.063]);
  const light = paper[0] * 0.2126 + paper[1] * 0.7152 + paper[2] * 0.0722 > 0.5;
  renderer.setPalette({
    light,
    paper,
    cool: readHslToken("--field-cool", [0.053, 0.414, 0.827]),
    warm: readHslToken("--field-warm", [0.83, 0.376, 0.03]),
  });
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

    applyPalette(renderer);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const narrowQuery = window.matchMedia("(max-width: 1023px)");

    const applyPreferences = () => {
      renderer.reducedMotion = motionQuery.matches;
      // On phones the copy sits over the middle of the plane, so the left-hand
      // guard that protects the desktop headline would dim the wrong third.
      renderer.copyGuard = guard === "left" && !narrowQuery.matches ? 1 : 0;
      renderer.trackIntensity = (narrowQuery.matches ? 0.6 : 1) * intensity;
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
    // Cached document height for scrollMode "document"; -1 means "re-measure".
    let documentSpan = -1;
    const resize = () => {
      documentSpan = -1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const coarse = coarseQuery.matches;

      if (coarse) {
        if (width !== lastWidth) tallest = height;
        else if (height <= tallest) return;
        else tallest = height;
      }
      lastWidth = width;

      // Cap DPR harder on phones: every extra pixel is another pass of bloom.
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
        // `scrollHeight` forces layout, and document mode used to read it on
        // every scroll frame. The page does not change height while you scroll
        // it, so measure once and refresh on resize.
        if (scrollMode === "document" && documentSpan < 0) {
          documentSpan = document.documentElement.scrollHeight - window.innerHeight;
        }
        const span = scrollMode === "document" ? documentSpan : window.innerHeight * 0.9;
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
    // Deliberately not the theme. See the palette effect below.
  }, [watchKey, intensity, guard, scrollMode, mounted]);

  /* Switching theme must not rebuild the renderer, and this effect is the whole
     reason it does not have to: the event, its geometry and the bloom are
     identical in both themes, and only a handful of composite uniforms differ.
     Rebuilding was worse than wasteful, it was fatal — `dispose` ends by calling
     `loseContext`, React reuses the same canvas element across the effect, and a
     canvas whose context has been lost hands the same dead context back to the
     next `getContext`. Shader compilation then failed, the constructor threw,
     and the component fell back to the CSS plane until a reload.

     The observer rather than a `resolvedTheme` dependency because the class on
     <html> is the thing the palette is actually read from, and watching the
     value that causes the class is a race against whoever applies it. */
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const sync = () => applyPalette(renderer);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => observer.disconnect();
  }, [mounted]);

  /* Every input that can replace the renderer belongs here, not just the ones
     that mean "reveal now". `reveal()` is state held on the instance, so a
     rebuild starts shut and only this effect can open it again. `mounted`
     covers the first pass, where the renderer does not exist yet. */
  useEffect(() => {
    if (ready || revealOn === "mount") rendererRef.current?.reveal();
  }, [ready, revealOn, mounted]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-background" aria-hidden="true">
      {failed || !mounted ? (
        <StaticFallback />
      ) : (
        <canvas
          /* Anything that rebuilds the renderer gets a new element to build on.
             The old one's context has been deliberately lost by then, and a lost
             context is handed straight back by the next getContext — so reusing
             the element would give the new renderer a dead one. */
          key={`${watchKey}|${intensity}|${guard}|${scrollMode}`}
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
    <div className="absolute left-1/2 top-0 h-[520px] w-[140vw] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(var(--halo)/0.10),transparent_70%)]" />
    <div className="absolute right-[-10%] top-1/4 h-[70vh] w-[70vw] bg-[radial-gradient(ellipse_at_center,hsl(var(--halo)/0.07),transparent_65%)]" />
    <div className="absolute inset-0 bg-dot-grid-primary opacity-40" />
  </div>
);

export default AtmosphereField;
