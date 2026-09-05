import { Fragment, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { hasFinePointer, subscribePointer } from "@/lib/pointer";
import { EASE } from "@/lib/motion";

export type HeadlineSegment = { text: string; accent?: boolean };

type Props = {
  segments: HeadlineSegment[];
  ready: boolean;
  className?: string;
};

const BASE_WEIGHT = 740;
const PEAK_WEIGHT = 900;
const INFLUENCE = 190; // px

/**
 * The headline, set per character.
 *
 * Two things happen to each glyph: it rises out of a per-word mask on the way
 * in, and afterwards its variable weight and baseline respond to how close the
 * cursor is. Every glyph is locked to the width it had at BASE_WEIGHT, so the
 * line never reflows as the weights swell.
 */
const KineticHeadline = ({ segments, ready, className = "" }: Props) => {
  const glyphsRef = useRef<HTMLSpanElement[]>([]);
  const centersRef = useRef<{ x: number; y: number }[]>([]);

  // Flatten to words while remembering which segment each came from, so the
  // stagger runs across the whole headline rather than restarting per segment.
  const words = useMemo(() => {
    let index = 0;
    return segments.flatMap((segment, segmentIndex) =>
      segment.text
        .split(" ")
        .filter(Boolean)
        .map((word, wordIndex) => ({
          word,
          accent: Boolean(segment.accent),
          /* Where a segment begins is where the line begins. See the break
             below. */
          opensSegment: segmentIndex > 0 && wordIndex === 0,
          key: `${segmentIndex}-${word}-${index}`,
          chars: word.split("").map((char) => ({ char, order: index++ })),
        })),
    );
  }, [segments]);

  useEffect(() => {
    const glyphs = glyphsRef.current.filter(Boolean);
    if (glyphs.length === 0) return;

    let raf = 0;
    let lockedWidths = false;

    const measure = () => {
      // Re-measure at the natural weight, otherwise each resize would bake in
      // whatever weight the cursor happened to be applying.
      for (const glyph of glyphs) {
        glyph.style.width = "";
        glyph.style.fontVariationSettings = `"wght" ${BASE_WEIGHT}`;
      }
      // A single-character inline-block already carries the inherited tracking
      // inside its box, and the parent adds it again after the box — so the
      // locked width has to give that back or the line grows by one em of
      // tracking per glyph.
      const tracking = parseFloat(getComputedStyle(glyphs[0]).letterSpacing) || 0;
      for (const glyph of glyphs) {
        glyph.style.width = `${glyph.getBoundingClientRect().width - tracking}px`;
      }
      refreshCenters();
      lockedWidths = true;
    };

    // Read-only: safe to run on scroll. `measure` writes styles first, which
    // invalidates layout for every glyph — far too costly per scroll frame.
    function refreshCenters() {
      centersRef.current = glyphs.map((glyph) => {
        const rect = glyph.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      });
    }

    // Wait for the webfont: measuring against the fallback would lock in the
    // wrong widths and the headline would look loose once Inter arrives.
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => {
      if (glyphs[0]?.isConnected) measure();
    });

    // Glyph centers measured mid-reveal are a line-height off, so take them
    // again once the last character has landed.
    const settle = ready ? window.setTimeout(measure, 1500) : 0;

    // Last value written per glyph. Most of the headline is far from the cursor
    // and unchanged frame to frame; skipping those keeps this to a handful of
    // style writes instead of one per character per frame.
    const applied = new Float32Array(glyphs.length).fill(-1);

    const applyPointer = (x: number, y: number) => {
      if (!lockedWidths) return;
      const centers = centersRef.current;
      for (let i = 0; i < glyphs.length; i++) {
        const center = centers[i];
        if (!center) continue;
        const dx = center.x - x;
        const dy = (center.y - y) * 1.35; // vertical falloff is tighter than horizontal
        const t = Math.max(0, 1 - Math.hypot(dx, dy) / INFLUENCE);
        const eased = t * t * (3 - 2 * t); // smoothstep
        if (Math.abs(eased - applied[i]) < 0.004) continue;
        applied[i] = eased;

        const glyph = glyphs[i];
        glyph.style.fontVariationSettings = `"wght" ${BASE_WEIGHT + (PEAK_WEIGHT - BASE_WEIGHT) * eased}`;
        glyph.style.setProperty("--lift", `${eased * -5}px`);
        glyph.style.setProperty("--glyph-glow", eased.toFixed(3));
      }
    };

    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);

    // The whole proximity response follows a cursor, and a touch screen has
    // none. Subscribing there costs a scroll listener that re-reads every
    // glyph's box on each frame — 31 forced layouts per frame, to feed an
    // effect that can never fire. Widths still get locked; nothing else runs.
    if (!hasFinePointer()) {
      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(settle);
        window.removeEventListener("resize", onResize);
      };
    }

    const unsubscribe = subscribePointer(applyPointer);

    // Centers are viewport-relative, so scrolling invalidates them — but only
    // their positions, not the locked widths.
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(refreshCenters);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [words, ready]);

  glyphsRef.current = [];

  /** The headline as one string, for anything that reads instead of looks. */
  const sentence = segments.map((segment) => segment.text).join(" ");

  // Static render (scripts/prerender.mjs): the sentence, once, and nothing
  // else. Everything below is a cursor-and-entrance device that cannot run
  // without a browser, and emitting it into the shipped HTML would hand every
  // crawler the most important heading on the site twice — once as a sentence,
  // once as "T h e  S y s t e m s". Text extractors do not honour aria-hidden,
  // so the fix is not to hide the glyphs but not to write them.
  //
  // Safe to diverge from the client tree because the client calls createRoot,
  // not hydrateRoot: React discards this markup and mounts the real headline.
  if (typeof window === "undefined") {
    return <h1 className={`[text-wrap:wrap] ${className}`}>{sentence}</h1>;
  }

  return (
    /* Opted out of the site-wide `text-wrap: balance` on headings. This
       headline is not one run of words the browser should even out — it is
       written as segments, and the break between them is where the accent
       starts. Balancing would move that break to wherever the line lengths
       happened to work out. */
    <h1 className={`[text-wrap:wrap] ${className}`}>
      {/* The headline, twice.

          Everything below is one <span> per character, which is what makes the
          per-glyph reveal and the cursor weight response possible — and which
          leaves the most important heading on the site as 31 separate text
          nodes. A screen reader walks that letter by letter, and a crawler
          extracting text gets "T h e S y s t e m s" or "TheSystems", never the
          sentence. So the sentence is stated once, plainly, for anything
          reading rather than looking, and the glyph machinery is hidden from
          the accessibility tree entirely. */}
      <span className="sr-only">{sentence}</span>
      <span aria-hidden="true">
      {words.map(({ word, accent, chars, key, opensSegment }) => (
        <Fragment key={key}>
          {/* A real break, rather than a hope.

              The note above says the break between segments is where the accent
              starts, and until this it was only true by luck: the words were one
              inline run and the browser broke them wherever they stopped fitting.
              "The Systems Companies / Decide With" happened to land right at
              every size that mattered. The line after it did not — "We Build It,
              Ship It, / and Answer for It" put "and" at the end of the first
              line, so the accent began mid-phrase on a white line and the second
              line opened on a word that belonged to the one above it. The whole
              point of writing a headline as segments is that the author decides
              this, so the author decides it. */}
          {opensSegment && <br />}
        <span
          /* Per-word mask. The padding gives descenders room inside the clip. */
          className="inline-block overflow-hidden pb-[0.14em] pr-[0.02em] align-bottom [margin-right:0.24em]"
        >
          {chars.map(({ char, order }) => (
            <motion.span
              key={`${key}-${order}`}
              /* No standing `will-change`: it would hold a compositor layer per
                 character for the life of the page, which on a phone is 31
                 layers of GPU memory sitting behind the WebGL plane long after
                 the one entrance animation is over. Framer Motion applies and
                 clears the hint around the animation itself. */
              className="inline-block"
              initial={{ y: "115%", opacity: 0 }}
              animate={ready ? { y: "0%", opacity: 1 } : { y: "115%", opacity: 0 }}
              transition={{
                duration: 1.05,
                delay: 0.06 + order * 0.022,
                ease: EASE,
              }}
            >
              <span
                ref={(node) => {
                  if (node) glyphsRef.current.push(node);
                }}
                className={`inline-block text-center [transform:translateY(var(--lift,0px))] [transition:transform_260ms_cubic-bezier(0.16,1,0.3,1)] ${
                  accent ? "hero-glyph-accent" : "hero-glyph"
                }`}
              >
                {char}
              </span>
            </motion.span>
          ))}
        </span>
        </Fragment>
      ))}
      </span>
    </h1>
  );
};

export default KineticHeadline;
