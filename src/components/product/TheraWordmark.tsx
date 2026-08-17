import { useEffect, useRef, useState } from "react";

/**
 * THERΛ, and where the name comes from.
 *
 *      θήρα  →  THERΛ  →  THE HUNT  →  THERΛ
 *
 * Θήρα is Greek for the hunt. The transliteration is exact, which is what makes
 * this a reveal rather than a pun someone forced: θ → TH, η → E (eta *is* the E
 * sound), ρ → R, α → Λ. Only θ splits in two. And THERA already contains
 * THE + RA, so the third beat is a seam in the existing word, not a new word.
 *
 * ── Provenance ───────────────────────────────────────────────────────────────
 * The geometry below is Thera's own logotype, copied coordinate-for-coordinate
 * from `thera/frontend/components/wordmark-reveal.tsx`, which traced it from
 * `thera/docs/look_design/logo.png`. Two things in the artwork no font will
 * give you, and both are load-bearing: the R drops the top half of its stem, so
 * the top bar and the bowl's underside float unconnected on the left; and the A
 * is a bare Λ with no crossbar, the one glyph that takes colour.
 *
 * It is a copy rather than a shared package because these two sites share no
 * build. That makes it the kind of duplicate that goes stale silently, so: if
 * the logotype changes in Thera, it changes here, and the paths are the whole
 * of what has to be brought across.
 *
 * ── What is *not* copied ─────────────────────────────────────────────────────
 * Thera renders this in its own palette on a near-black page. Here it has to
 * sit in a themed heading, so the letters take `currentColor` from the h1 and
 * only the Λ keeps Thera's teal, themed in index.css. Which is also the
 * product's own rule — its brand guide spends the accent on a single glyph
 * precisely so the wordmark still reads as text.
 */

/** Cap height in user units; every coordinate is relative to this. */
const SW = 7.5;

/** The Λ carries a little more weight than the letters beside it. */
const SW_ACCENT = 9.5;

/* Every beat is anchored left, and this is the one place the port deliberately
   departs from Thera's own version.
 
   There, the wordmark is a centred masthead, so each beat is centred in the box
   and the Latin slides half the growth each way — anchoring it would leave the
   resting logo visibly off-centre in a box sized for a state it is not in.
   Here the hero is left-aligned: the eyebrow, the tagline, the rule, the copy
   and the buttons all start on the same margin, and a wordmark centred in a box
   sized for "THE HUNT" hangs about 80px to the right of that margin, which
   reads as a mistake rather than as a lockup.
 
   Anchoring costs nothing, because all three beats already begin at x=0 —
   θήρα 0→274, THERΛ 0→488.51, THE HUNT 0→741.5. So there is no offset to
   apply and nothing slides: THE simply stays where it is while RΛ swaps out
   for HUNT, which makes the seam the sequence is about easier to see, not
   harder. The box stays sized for the widest beat so the layout never moves. */

/**
 * θήρα, drawn rather than typeset.
 *
 * Two reasons it has to be. Inter has no Greek coverage to rely on, so `<text>`
 * would fall through to whatever the OS happens to have. And the crossfade only
 * works if both words share a stroke weight — a typeset face beside a 7.5-unit
 * monoline visibly changes weight mid-transition.
 *
 * Lowercase, because uppercase ΘΗΡΑ in this geometric hand is very nearly
 * O H P A and reads as a misspelt Latin word. Lowercase is unmistakable: θ is
 * an ovoid with a crossbar, η has a descender no Latin n has, ρ is a p through
 * the baseline, α is single-storey. Round caps — the Greek is a different
 * voice, and butt caps on these curves read as broken strokes.
 */
const Greek = () => (
  <g
    className="thera-wm-greek"
    stroke="currentColor"
    strokeWidth={SW}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* θ — ovoid plus the crossbar that separates it from omicron. */}
    <ellipse cx="25" cy="39" rx="25" ry="39" />
    <path d="M0 39 H50" />

    {/* ή — n-shoulder, a right stem below the baseline, and the tonos. */}
    <path d="M82 78 V40 Q82 26 106.5 26 Q131 26 131 40 V104" />
    <path d="M94 16 L107 2" />

    {/* ρ — bowl at x-height, stem through the baseline to the descender. */}
    <path d="M163 26 V104" />
    <path d="M163 26 A26 26 0 0 1 163 78" />

    {/* α — single-storey, and set 17 units tighter to ρ than the other pairs
        are to each other. Measured, the gaps were nearly equal, but ρ's bowl
        and α's bowl are two curves facing each other: they only reach that
        distance at one point before falling away above and below, while
        straight stems hold their gap down the whole letter. Equal metric
        spacing reads as a hole here. */}
    <path d="M263 28 C207 23 207 81 263 76" />
    <path d="M263 26 V70 Q263 78 274 77" />
  </g>
);

const TheraWordmark = ({ className = "" }: { className?: string }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [run, setRun] = useState(false);

  /* Plays when it is actually on screen, and only ever once. In this hero it is
     above the fold and fires immediately, but the observer is still the right
     trigger: it costs nothing, and it is what keeps the component correct if it
     is ever placed further down a page. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRun(true);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      // Sized for the widest beat, "THE HUNT" at 741.5 units, so nothing on the
      // page shifts as the sequence runs through its three widths.
      viewBox="-8 -8 765.5 116"
      aria-hidden="true"
      focusable="false"
      /* max-w-full is load-bearing, not defensive. The box is 6.6x as wide as
         it is tall, so a height class buys 6.6x that height in width: at the
         mobile size this asks for ~370px inside a 358px content column. The
         default preserveAspectRatio then scales the drawing down to fit instead
         of overflowing, which costs a little vertical whitespace and distorts
         nothing. */
      className={`thera-wm max-w-full ${run ? "thera-wm-run" : ""} ${className}`}
      fill="none"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <Greek />

      <g className="thera-wm-latin">
        <g stroke="currentColor" strokeWidth={SW}>
          {/* T */}
          <path d="M0 3.75 H66" />
          <path d="M33 0 V100" />
          {/* H */}
          <path d="M109.75 0 V100" />
          <path d="M168.25 0 V100" />
          <path d="M109.75 50 H168.25" />
          {/* E — the middle arm is short, as in the artwork */}
          <path d="M215.75 0 V100" />
          <path d="M215.75 3.75 H272" />
          <path d="M215.75 50 H264" />
          <path d="M215.75 96.25 H272" />
        </g>

        {/* RΛ — the resting tail. */}
        <g className="thera-wm-ra">
          <g stroke="currentColor" strokeWidth={SW}>
            {/* Both bars run to x=312, the stem's left *edge* rather than its
                centreline at 315.75. On E and H that distinction is invisible,
                buried inside a full-height stem; here the top bar terminates in
                open air, so ending it at the centreline left the stem jutting
                half a stroke further left than the letter above it. */}
            <path d="M312 3.75 H352 A23.125 23.125 0 0 1 352 50 H312" />
            <path d="M315.75 50 V100" />
            <path d="M347 50 L375 100" />
          </g>
          {/* bevel, not the miter every other corner uses. At the Λ's 36.5° a
              miter throws a spike 15.2 units above the vertex into a viewBox
              with 8 units of headroom, so the point was being sliced by the
              clip rather than by design. */}
          <path
            d="M418 100 L451 0 L484 100"
            stroke="hsl(var(--thera-accent))"
            strokeWidth={SW_ACCENT}
            strokeLinejoin="bevel"
          />
        </g>

        {/* HUNT — all accent. It is the word the sequence exists to show.
            Starts at 362, a 90-unit word space: the wordmark's own letter gaps
            run 40–47, and a first pass at 60 rendered as "THEHUNT". */}
        <g className="thera-wm-hunt" stroke="hsl(var(--thera-accent))" strokeWidth={SW}>
          {/* H */}
          <path d="M362 0 V100" />
          <path d="M420.5 0 V100" />
          <path d="M362 50 H420.5" />
          {/* U */}
          <path d="M468 0 V70 A29.25 29.25 0 0 0 526.5 70 V0" />
          {/* N */}
          <path d="M574 0 V100" />
          <path d="M632.5 0 V100" />
          <path d="M574 0 L632.5 100" />
          {/* T */}
          <path d="M675.5 3.75 H741.5" />
          <path d="M708.5 0 V100" />
        </g>
      </g>
    </svg>
  );
};

export default TheraWordmark;
