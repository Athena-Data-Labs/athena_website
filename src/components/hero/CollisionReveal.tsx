import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { hasFinePointer } from "@/lib/pointer";
import { useStageReady } from "@/lib/stage";
import { prefersReducedMotion } from "@/lib/motion";
import { useIsDark } from "@/lib/theme";
import {
  CLOSED,
  setDisplayScale,
  setRevealActive,
  subscribePulse,
} from "@/components/hero/reveal-timing";
import mascotDark from "@/assets/athena-agent.webp";
import mascotLight from "@/assets/athena-agent-light.webp";

/**
 * The page opens inside the collision and contracts until it is small enough
 * to hold.
 *
 * The plane this wraps is the site's deepest layer — one fixed, full-viewport
 * WebGL field that every window on the page looks onto. This neither clips it
 * nor touches its camera: it scales the whole thing down into her hands, so
 * what ends up in the sphere is the entire apparatus rather than whichever part
 * of it happened to fall behind a porthole.
 *
 * That distinction is the design. The first version masked the plane instead,
 * which meant her sphere had to be placed wherever the collision vertex framed
 * up — and the vertex sits high, which pushed her crest through the header.
 * Bringing the field to her makes her placement free again.
 *
 * She composites for free. Her fingers are drawn over the sphere and its fill
 * is cut to transparent, so the field shows through with her hand in front of
 * it — no second layer, nothing to keep in sync.
 *
 * The field arrives as children rather than as a sibling because a transform
 * makes its element the containing block for fixed descendants: the plane keeps
 * its own `fixed inset-0`, resolves it against this wrapper, and still sizes
 * its backing store from the window rather than from what it has been scaled
 * to. Nothing is reallocated while the contraction is running, which the
 * field's own resize comment calls the single biggest source of scroll stutter.
 *
 * What the plane does not get for free is the resolution it no longer needs.
 * Contracted, about seven per cent of what it renders survives the clip, so
 * this publishes the scale it is being shown at and the plane drops its backing
 * store to match — once, well after the reader has stopped moving. See
 * `reveal-timing`.
 */

/**
 * Where the sphere sits inside the 1024² drawing, as fractions of its width.
 *
 * Taken off the silhouette by hand. The flat cel version of her fitted
 * automatically to sub-pixel accuracy, but the engraved drawing defeats every
 * automatic method: hatching quantises to ink, which fragments the fill so a
 * flood stops near its seed, makes a morphological close a knife edge between
 * under-filling and bridging into her shirt, and saturates a Hough score
 * because ink is then everywhere inside the mass.
 */
const SPHERE = { cx: 753 / 1024, cy: 749 / 1024, r: 135 / 1024 };

/**
 * The clip stops a hair outside the hole cut in the drawing, so its edge lands
 * under the sphere's own ink rim rather than beside it.
 */
const OVERSHOOT = 1.02;

/** She resolves out of the dark as it contracts onto her, and then holds. */
const FIGURE_IN: [number, number] = [0.05, 0.34];
/**
 * One target she reaches and keeps. She used to arrive at full strength and
 * recede afterwards, which is the right idea and the wrong shape: the house
 * curve is a quintic ease-out, so two thirds of that drop happened in the first
 * fifth of its range and it read as a flash rather than as a figure stepping
 * back. Move this if she is too loud or too faint.
 *
 * Raised with the relit artwork. She is now drawn as a figure lit only by the
 * sphere, which means most of her is shadow — and shadow drawn at the page's
 * own black is nothing at all. Some of that was fixed where it belonged, by
 * lifting the plate's ink off the background in the pipeline; this is the rest.
 * Note that it is the smaller of the two levers by a long way: fourteen points
 * of opacity moved her median by four values, because fading near-black onto
 * near-black cannot brighten anything.
 */
/**
 * How present she is, per theme.
 *
 * Not one number, because the two pages do opposite things to the text she sits
 * behind. On the black page she is lighter than the paper, so she *raises* the
 * background under white copy; on the white page she is darker than it, so she
 * *lowers* the background under dark copy. Both cost contrast, but only one of
 * them has room to spend: measured on the services copy that crosses her, dark
 * mode runs 7.40:1 beside her and 6.43:1 over her, while light mode runs 4.92:1
 * beside her — already only just past AA — and 4.48:1 over her, which is past
 * it in the wrong direction. Equal opacity is not equal treatment.
 */
const BACKDROP = { dark: 0.46, light: 0.34 };

/**
 * The same light again, but landing on her and nothing else.
 *
 * `GLOW` below is light in the air: it screens over whatever is behind it,
 * which is what makes it read as a glow rather than as a decal — and which is
 * also why it has to stay small and weak, because everything it does to her it
 * also does to the body copy beside her.
 *
 * This one is masked by her own drawing, so it cannot touch the page at all. No
 * spill to pay for means it can be far stronger and reach much further: out to
 * three quarters of her box, which is where the crest is. It is what makes the
 * helmet answer the collision.
 *
 * Her alpha is the mask, so the falloff has to come from the gradient — and the
 * sphere is cut out of her, so the hole stays honest: no glow is painted where
 * the live collision is showing through.
 */
/* `reach` is the gradient's radius as a fraction of her box, and it has to be
   read together with the stops below: the last stop sits at 86% of the radius,
   not at 86% of the box. Her crest is 0.64 of the box from the sphere, so a
   radius of 0.75 put it past the end of the gradient and the helmet got
   nothing — measurably nothing, a mean of zero across the whole crest. */
const CAST = { reach: 0.95, base: 0.4, swing: 0.6 };

/**
 * The light the sphere throws on the hand around it.
 *
 * `spread` is the glow's diameter as a multiple of the sphere's, generous on
 * purpose: the bright core lands on her fingers and the tail has to reach her
 * jaw, or it reads as a sticker with a halo rather than as a lit figure.
 * `base` is what a quiet sphere throws and `swing` is what a collision adds,
 * so the hand around the glass brightens with what is happening inside it.
 *
 * It sits above her rather than inside her opacity, and that is the difference
 * between the effect working and not existing. Inside, everything it does is
 * multiplied by the 38% she is drawn at, which capped the light on her fingers
 * at five values out of 255 — real, warm, correct, and invisible. Light coming
 * off a source is brighter than the thing it lands on; it cannot be a member of
 * that thing's group. What it costs is a little spill onto the page around her,
 * which is what a light source does anyway.
 *
 * Screen blending, so it can only ever add. On paper that lifts and warms the
 * ink near the glass, which is what halation does there, and it leaves the
 * near-white page essentially alone.
 */
const GLOW = { spread: 3.4, base: 0.45, swing: 0.55 };

/**
 * The counter-light: cool, weak, and from the other side.
 *
 * She is lit by one source. One source is what a spotlight does, and a figure
 * under one has a lit side and a side that is simply absent — the form stops
 * where the key light stops, and the silhouette dissolves into a black page.
 * Every lighting setup that reads as expensive answers the key with something
 * far weaker from the opposite direction, cool against warm, whose whole job is
 * to draw the far edge and say the figure has a back to it.
 *
 * Origin is up and to the left because the sphere is down and to the right, and
 * `reach` is generous because this is ambient, not a second spotlight: it
 * should reach the crest, the shoulder and the far arm at once and land hard on
 * none of them. Masked to her, like CAST, so a light that exists to separate
 * her from the page cannot also fall on the page.
 *
 * It does not pulse. The collision is the event; a room does not brighten
 * because something in it caught fire.
 */
/* `level` is set against the key, not by eye, and measured by suppressing the
   other two screen layers rather than by forcing this one on — an `opacity`
   override cannot be reverted back to a value framer-motion writes inline, so
   isolating a layer that way silently measures it at full strength.
   Averaged over four alternating frames, on the crest, where this light does
   its work: the key puts +6.3 mean there and the halo does not reach that far
   up at all, so this lands +4.6 — under its key, and nearest to it exactly
   where the key is weakest. On her face the key is +19.8 and this is +2.1,
   which is as close to absent as makes no difference. That ratio, strong where
   the key fails and gone where it doesn't, is the whole job. Spill onto the
   page beside her: 0.00, because it is masked to her. */
const RIM = { at: [0.2, 0.13], reach: 0.85, level: 0.2 };

/**
 * The glint the collision strikes off her helmet.
 *
 * This was a band travelling across the dome on a timer, and two things were
 * wrong with it. It crossed left to right, away from the only light source in
 * the picture — the sphere is below and to her right, so a highlight sweeping
 * the other way has nowhere to have come from. And a highlight that moves
 * continuously is a moving object: the eye tracks it, it never stops, and it
 * competes with the one thing on this page that is supposed to be an event.
 *
 * A glint does not travel. It is a fixed spot on a curved surface that catches
 * a light for as long as the light is there, so it lives on the *same* curve as
 * the flash and says the same thing the contact shadow says — that these two
 * objects are in one room.
 *
 * `at` is the helmet's outer edge beside her eye — the lit rim where the bowl
 * turns away — which is the armour geometrically nearest the sphere and so
 * where a specular belongs: a highlight sits where the surface normal bisects
 * the eye and the source, and the source is low and to her right. The drawing
 * has already put its own highlight along that edge, so this lands on a bright
 * line rather than inventing one.
 *
 * **This is per-drawing and does not survive a redraw.** It is a position on a
 * helmet, and a new helmet moves it: aimed at the previous version's cheek
 * guard, the same coordinates landed on the current one's *hair*. Two obvious
 * ways of finding it automatically both fail — "brightest metal above the face"
 * lands on her lit cheek, and adding "cool family" does not save it, because
 * her face is cross-hatched and the hatching reads cool too. The helmet is not
 * separable from the head by colour on this drawing; it is separable by looking
 * at it. So check this against the artwork whenever the artwork changes.
 *
 * `reach` is small and taller than it is wide, following that rim. A radial
 * generous enough to cover the whole helmet also covers her forehead, and a
 * highlight on a face is a different and much larger claim than one on metal.
 *
 * `bite` sharpens the response: light on a curved specular is not linear in the
 * source, and squaring it keeps the glint off entirely during the quiet part of
 * an event instead of sitting there at a permanent dim shimmer.
 */
const GLINT = { at: [0.722, 0.33], reach: [0.025, 0.055], level: 0.8, bite: 2.0 };

/**
 * The collision landing on the rest of the page.
 *
 * Everything else here lights *her*, and she is behind the copy — so the one
 * thing on the page that is an event was, until this, an event happening in a
 * box that nothing else in the room noticed. Light does not work that way. A
 * flash bright enough to throw a shadow off her fingers falls on the headline
 * beside her too.
 *
 * So: one fixed layer above the content rather than behind it, which is the
 * whole point and the only reason this cannot simply be a wider `GLOW` — that
 * one is in the backdrop, and light behind text cannot light text. Centred
 * roughly where the held sphere sits and enormous, because at this distance
 * the falloff is all that carries the idea; her 40px of drift is not worth
 * tracking against a radius of most of the viewport.
 *
 * `level` is small and has to stay small. This is the only layer on the page
 * that touches running copy, and it is priced in contrast: see the measurement
 * on the body text below.
 */
const ROOM = { at: [0.63, 0.68], reach: 0.9, level: 0.09 };

/**
 * How far she drifts against the page as it scrolls, in pixels, and how quickly.
 *
 * She is on a fixed layer, so without this she is welded to the glass of the
 * screen while everything in front of her moves — which is the one thing a
 * backdrop must not look like. Moving her *slower* than the content is what
 * puts her behind it: parallax is the only depth cue a flat page has that does
 * not cost a shadow.
 *
 * Exponential rather than linear, because there is no end to scroll against.
 * The reveal's own progress saturates after nine tenths of a viewport, and a
 * drift that stopped there would have her pinned again for ninety per cent of
 * the page. This keeps moving well past the fold and asymptotes instead of
 * ending, so nothing has to know how tall the document is.
 *
 * The distance is capped by her crest, not by taste. Her drawing starts sixteen
 * pixels into a 1024 box, so she is already meeting the header at rest, and
 * every pixel of drift takes another one off the top of the plume. Forty is
 * enough to read as depth and leaves the crest intact.
 */
const DRIFT = { distance: -40, over: 2400 };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/**
 * Smoothstep, and deliberately not the house curve.
 *
 * `EASE` is a quintic ease-out, which is right for a move that plays on its own
 * clock: it leaves quickly and settles under its own weight. This one plays on
 * the reader's clock, and an ease-out scrubbed by scroll spends its budget in
 * the wrong place — a quintic is two thirds finished a fifth of the way in, so
 * the first ninety pixels of scroll did almost the whole contraction and the
 * remaining two hundred did nothing. Smoothstep is flat at both ends and steep
 * through the middle, which is what a timeline someone is dragging wants.
 */
const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * How long the contraction takes to close half the distance to the scroll
 * position, in seconds. Frame-rate independent.
 *
 * Reading `window.scrollY` raw made the aperture snap: a flick moves the page
 * forty to eighty pixels a frame, and the hero's own comment calls that out as
 * what makes a main-thread transform judder against a composited scroll. So it
 * is damped.
 *
 * But deliberately much faster than `FieldRenderer`, which damps its own scroll
 * on a time constant near a second. Copying that was the first thing tried and
 * it was wrong: a camera dolly can lag, because it changes what is *inside* the
 * porthole, and nobody can see it arrive late. The porthole itself is an object
 * on the page, and an object that keeps moving for a second after you stop
 * scrolling reads as broken rather than as smooth. Seventy milliseconds takes
 * the judder out of a flick and is gone before a reader could call it lag.
 */
const HALF_LIFE = 0.07;

/**
 * The unprompted playthrough, in seconds.
 *
 * The reveal is scrubbed by scroll, which means a reader who lands, takes the
 * headline and clicks the first button never sees it — and that reader is the
 * one who decided fastest. So it plays itself once: pulls back until the whole
 * apparatus is in her hands, holds long enough to be read as a picture rather
 * than as a transition, and returns the hero to where it started.
 *
 * It returns rather than staying closed because the hero is a full-bleed plane
 * with a headline over it, and leaving it as a two-hundred-pixel sphere on an
 * empty page would be answering a question nobody asked yet. Out and back is a
 * demonstration; it says what is here and what scrolling will do, and then gets
 * out of the way.
 *
 * The delay lets the hero's own entrance land first — the copy staggers in over
 * about a second — so this is the second beat rather than a competing one.
 */
const INTRO = { delay: 1.2, out: 1.35, hold: 0.5, back: 1.1 };
const INTRO_END = INTRO.out + INTRO.hold + INTRO.back;
/**
 * Where the playthrough runs to, in the scroll-progress units everything here
 * is expressed in — not 1.
 *
 * `CLOSED` is where the contraction finishes and `FIGURE_IN` is where she
 * finishes arriving, and the whole range past those is scroll the reveal has
 * nothing left to do with. Driving the playhead to 1 spent nine tenths of the
 * move sitting at the end of it: the quintic crossed 0.32 in the first tenth of
 * a second, so the contraction snapped shut, held for two and a half seconds,
 * and snapped open again.
 */
const PLAY_TO = Math.max(CLOSED, FIGURE_IN[1]);

const damp = (current: number, target: number, dt: number) =>
  current + (target - current) * (1 - Math.pow(2, -dt / HALF_LIFE));

/**
 * The mask she arrives through: a soft circle opening out of the sphere.
 *
 * Fading in is what everything does by default, and nothing else on this page
 * settles for it — the plane opens as a horizon slit, the headline is set a
 * glyph at a time. She should arrive for a reason, and the reason is in the
 * picture already: she is holding the only light source in the frame, so it is
 * the light that finds her. It is also the cheapest possible version of that
 * idea, one gradient, and it costs nothing at rest because it is dropped
 * entirely the moment she has fully arrived.
 */
const arrival = (a: number) => {
  /* `ellipse` with two equal percentages rather than `circle`, because a circle
     may only be given a length — `circle 74%` is not a parse error you will be
     told about, it is a gradient that quietly comes out as something else. The
     box these are resolved against is square, so equal percentages are a
     circle. */
  const r = (a * 150).toFixed(1);
  return `radial-gradient(ellipse ${r}% ${r}% at ${(SPHERE.cx * 100).toFixed(1)}% ${(
    SPHERE.cy * 100
  ).toFixed(1)}%, #000 0%, #000 62%, rgba(0,0,0,0) 100%)`;
};

const CollisionReveal = ({ children }: { children?: ReactNode }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ready = useStageReady();
  const dark = useIsDark();
  const drawing = dark ? mascotDark : mascotLight;
  /* Read through a ref so the whole scroll effect does not tear down and
     rebuild on a theme toggle; the next frame picks the new value up. */
  const backdrop = useRef(BACKDROP.dark);
  backdrop.current = dark ? BACKDROP.dark : BACKDROP.light;
  /* Assigned by the effect below, called by the one after it. A ref rather than
     a dependency because `ready` flipping must not tear down and rebuild the
     listeners the reveal is running on. */
  const startIntro = useRef<(() => void) | null>(null);
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const clip = useMotionValue("none");
  const figure = useMotionValue(0);
  const mask = useMotionValue("none");
  const pulse = useMotionValue(GLOW.base);
  const cast = useMotionValue(CAST.base);
  const flash = useMotionValue(0);
  /* No light before there is anything holding it: her arrival gates the glow,
     so at the top of the page the sphere does not glow at a hand that is not
     drawn yet. */
  const arrived = useMotionValue(0);
  const drift = useMotionValue(0);
  const glow = useTransform([arrived, pulse], ([a, p]: number[]) => a * p);
  const castOpacity = useTransform([arrived, cast], ([a, c]: number[]) => a * c);
  const rimOpacity = useTransform(arrived, (a: number) => a * RIM.level);
  const glintOpacity = useTransform([arrived, flash], ([a, f]: number[]) => a * f * GLINT.level);
  const roomOpacity = useTransform([arrived, flash], ([a, f]: number[]) => a * f * ROOM.level);
  const geom = useRef({ ready: false, cx: 0, cy: 0, r: 0, s: 1, r0: 4000 });

  /*
   * Read once, at mount. The reveal is a viewport-crossing move, which is what
   * the reduced-motion preference asks not to see, and it rides a scroll
   * listener a touch device should not pay for. When it is off the field is
   * handed back untouched rather than shown as a lesser version of the effect.
   */
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion());

  useEffect(() => {
    if (!enabled) return;
    const el = wrapRef.current;
    if (!el) return;

    const apply = (p: number, d: number) => {
      const g = geom.current;
      if (!g.ready) return;
      drift.set(d);
      const t = ease(span(p, 0, CLOSED));
      const midX = window.innerWidth / 2;
      const midY = window.innerHeight / 2;
      const cx = midX + (g.cx - midX) * t;
      /* Her drift moves the sphere, so the aperture has to move with it —
         analytically, from the number that caused it. Re-measuring her box per
         frame would give the same answer and cost a layout on every one. */
      const cy = midY + (g.cy + d - midY) * t;

      scale.set(1 + (g.s - 1) * t);
      x.set(cx - midX);
      y.set(cy - midY);
      /*
       * No clip at all until the contraction has actually started.
       *
       * A circle of several thousand pixels covers the viewport and looks like
       * a no-op, but it is not one: it is a clip on a fixed, full-viewport
       * layer holding a promoted WebGL canvas, and at the very top of the page
       * an overscroll bounce moves the visual viewport out from under the
       * coordinates it is expressed in — the circle ends up off-screen and
       * takes the whole plane with it. Nothing to clip against, nothing to go
       * wrong. The radius is geometric once it does engage, so the aperture
       * covers equal ratios in equal time rather than sitting off-screen for
       * most of the scroll and collapsing at the end.
       */
      clip.set(
        t < 0.004
          ? "none"
          : `circle(${g.r * Math.pow(g.r0 / g.r, 1 - t)}px at ${cx}px ${cy}px)`,
      );
      /* One term for both: she is not fading in and separately being unmasked,
         she is being found by the light, and the opacity is what keeps the
         first sliver of that from arriving as a hard edge. */
      const a = ease(span(p, FIGURE_IN[0], FIGURE_IN[1]));
      figure.set(backdrop.current * a);
      arrived.set(a);
      // Dropped at both ends, for the same reason the clip is: a mask is a
      // per-frame raster of a viewport-sized layer, and neither a reader at the
      // top nor one halfway down the page is watching her arrive.
      mask.set(a <= 0.001 || a >= 0.999 ? "none" : arrival(a));
    };

    /*
     * The denominator the field uses for its own camera dolly, so the
     * contraction and the pull-back are measuring the same thing.
     */
    /* Her drift, and the value `measure` has to subtract back out: the wrapper
       carries the translate, so its measured box already includes it. */
    let driftPx = 0;
    const readDrift = () =>
      DRIFT.distance * (1 - Math.exp(-window.scrollY / DRIFT.over));

    const read = () =>
      clamp01(window.scrollY / Math.max(1, window.innerHeight * 0.9));

    const measure = () => {
      const box = el.getBoundingClientRect();
      if (box.width <= 0) return;
      const r = box.width * SPHERE.r * OVERSHOOT;
      geom.current = {
        ready: true,
        cx: box.left + box.width * SPHERE.cx,
        cy: box.top + box.height * SPHERE.cy - driftPx,
        r,
        /*
         * Scale the plane so its height fills the sphere. Filling by height
         * rather than fitting by width is deliberate: the scene is 16:9 and the
         * sphere is round, so something has to give, and losing the far ends of
         * the barrel costs less than ringing the collision in empty bands.
         */
        s: (2 * r) / window.innerHeight,
        r0: Math.hypot(window.innerWidth, window.innerHeight),
      };
      /* A resize changes the denominator, so the target is stale until it is
         re-read. Snap to it when nothing is in flight rather than animating to
         a value the reader never scrolled to. */
      target = read();
      if (!frame) current = target;
      apply(current, driftPx);
    };

    /*
     * A frame loop that runs only while the value is still catching up, rather
     * than one frame per scroll event. Damping needs a clock — the value has to
     * keep converging after the last scroll event lands — but it should not
     * hold a rAF open for a page nobody is scrolling. The loop starts on scroll
     * and retires itself the moment it is within a pixel-invisible fraction of
     * the target.
     *
     * The listener stays coalesced and passive. It is not a `useScroll`
     * subscription because Framer's measures the document every frame to
     * produce its progress value, which the hero's own comment gives as the
     * reason it keeps a single subscription; this layer outlives the hero and
     * would be a second one.
     */
    let current = read();
    let target = current;
    driftPx = readDrift();
    let driftTarget = driftPx;
    let frame = 0;
    let last = 0;
    /* The playthrough runs on wall time rather than on `target`, so it is a
       separate branch of the same loop rather than a second one. */
    let playing = false;
    let played = false;
    let startedAt = 0;
    let delay = 0;

    /* Smoothstep both ways, and not the house ease-out, for the same reason the
       scrubbed version is not: a quintic is two thirds done in the first fifth
       of its range, which is right for something being thrown and wrong for a
       camera. This move exists to be watched — it is the only chance a reader
       who never scrolls gets to see where the collision goes — so it wants a
       flat start, a steady middle and a flat finish at both ends.

       Both phases are expressed against `target` rather than against zero, so a
       scroll landing mid-move is returned to instead of overwritten. */
    const playhead = (elapsed: number) => {
      const rest = target;
      const reach = Math.max(rest, PLAY_TO);
      if (elapsed < INTRO.out) return rest + (reach - rest) * ease(elapsed / INTRO.out);
      if (elapsed < INTRO.out + INTRO.hold) return reach;
      return rest + (reach - rest) * (1 - ease((elapsed - INTRO.out - INTRO.hold) / INTRO.back));
    };

    /*
     * How small the plane is being shown, for whoever is drawing it.
     *
     * Only on the two edges of a move, never per frame. Growing has to be
     * answered at once or the plane is visibly soft for the whole way back up;
     * shrinking can wait, and the consumer makes it wait, because the thing it
     * does about this costs an allocation.
     */
    const publish = () => {
      const g = geom.current;
      setDisplayScale(g.ready ? 1 + (g.s - 1) * ease(span(current, 0, CLOSED)) : 1);
    };

    const tick = (now: number) => {
      if (playing) {
        const elapsed = (now - startedAt) / 1000;
        if (elapsed >= INTRO_END) {
          playing = false;
          current = target;
          apply(current, driftPx);
          publish();
          frame = 0;
          return;
        }
        current = playhead(elapsed);
        apply(current, driftPx);
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      current = damp(current, target, dt);
      if (Math.abs(target - current) < 0.0002) current = target;
      driftPx = damp(driftPx, driftTarget, dt);
      if (Math.abs(driftTarget - driftPx) < 0.05) driftPx = driftTarget;
      apply(current, driftPx);
      /* Both, or the loop retires while she is still catching up. The
         contraction is finished after nine tenths of a viewport and the drift
         is not finished for several thousand pixels more. */
      if (current === target && driftPx === driftTarget) {
        frame = 0;
        publish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = read();
      driftTarget = readDrift();
      /* The reader has taken over, and they outrank the demonstration. Cleared
         before the frame check, because during the playthrough there is always
         a frame in flight and returning early would leave it running. `current`
         is left where it is, so the damping picks the move up from there rather
         than jumping. */
      playing = false;
      if (frame) return;
      // Full resolution back before the plane has grown into it.
      if (target < current) setDisplayScale(1);
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    /*
     * Play it once, unasked, for the reader who never scrolls.
     *
     * Only from the top: someone who arrived at an anchor, or who started
     * reading before the stage handed over, is already somewhere, and moving
     * the page under them is the one thing this must not do. The check runs
     * again when the timer fires, because the delay is long enough to scroll in.
     */
    startIntro.current = () => {
      if (played || !geom.current.ready || window.scrollY > 4) return;
      played = true;
      delay = window.setTimeout(() => {
        if (window.scrollY > 4) return;
        playing = true;
        startedAt = performance.now();
        if (!frame) frame = requestAnimationFrame(tick);
      }, INTRO.delay * 1000);
    };

    measure();
    publish();
    /* Only from here: everything above this line can bail, and the plane must
       not be told it is being held by a reveal that never started. */
    setRevealActive(true);
    /* Both signals, and neither is redundant. The observer catches the box
       changing size, which `window.resize` can miss when a scrollbar appears.
       The window listener catches the box *moving* without resizing, which the
       observer cannot see at all: the wrapper is square and height-driven, so a
       window that only gets narrower slides it sideways under
       `left-1/2 -translate-x-1/2` while its own dimensions never change — and
       `measure` reads its left edge. */
    const observer = new ResizeObserver(() => {
      measure();
      publish();
    });
    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(delay);
      startIntro.current = null;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      // Nobody is contracting the plane any more, so nobody is entitled to ask
      // it to render small, or to drop the guard that keeps it off the copy.
      setRevealActive(false);
      setDisplayScale(1);
    };
  }, [enabled, scale, x, y, clip, figure, mask, arrived, drift]);

  /* The sphere's own light, straight off the event that is making it. Outside
     the effect above because it has nothing to do with scrolling and no reason
     to be torn down when that one is. */
  useEffect(() => {
    if (!enabled) return;
    return subscribePulse((v) => {
      pulse.set(GLOW.base + GLOW.swing * v);
      cast.set(CAST.base + CAST.swing * v);
      // Only the positive half. A specular cannot be darker than not being
      // there, so the anticipation dip simply leaves it off.
      flash.set(Math.pow(Math.max(0, v), GLINT.bite));
    });
  }, [enabled, pulse, cast, flash]);

  /* Separate from the effect above so that the stage handing over cannot tear
     down and rebuild the reveal's listeners — and declared after it, because
     effects run in order and this one calls what that one assigns. `ready` is
     already true on a repeat visit, which is fine: the playthrough is for
     whoever has not scrolled, not for whoever has not been here before. */
  useEffect(() => {
    if (ready) startIntro.current?.();
  }, [ready]);

  if (!enabled) return <>{children}</>;

  return (
    <>
      {/* The event, landing on everything else. Above the content and below the
          grain. See ROOM. */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[55] hidden mix-blend-screen lg:block"
        style={{
          opacity: roomOpacity,
          backgroundImage: `radial-gradient(ellipse ${ROOM.reach * 100}% ${
            ROOM.reach * 100
          }% at ${ROOM.at[0] * 100}% ${ROOM.at[1] * 100}%, hsl(var(--field-warm) / 0.5) 0%, hsl(var(--field-warm) / 0.16) 34%, rgba(0,0,0,0) 82%)`,
        }}
        aria-hidden="true"
      />

      {/* The plane, contracted. The clip sits on the outer element so its circle
          stays in viewport coordinates while the inner one carries the
          transform; both on one element would scale the clip along with the
          content it is meant to be framing. */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ clipPath: clip }}
        aria-hidden="true"
      >
        {/* Deliberately not promoted. The canvas inside already forces its own
            layer — AtmosphereField gives it `opacity: 0.999` for exactly that —
            and adding `will-change: transform` here stacked a third composited
            layer under a clip that changes every frame, which is where the
            sphere went black on a fast scroll. */}
        <motion.div className="absolute inset-0" style={{ x, y, scale }}>
          {children}
        </motion.div>
      </motion.div>

      {/* Her, unclipped, above it. Exactly one viewport tall and sitting on the
          bottom edge, so she bleeds off the foot of the screen without her crest
          reaching the header — placement is free again now that the field comes
          to her hands rather than her hands going to the field. */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block" aria-hidden="true">
        {/* `x` as a transform rather than Tailwind's `-translate-x-1/2`: the
            drift writes this element's transform, and the two cannot share it. */}
        <motion.div
          ref={wrapRef}
          className="absolute bottom-0 left-1/2 aspect-square h-screen"
          style={{ x: "-50%", y: drift }}
        >
          {/*
            Every box from here down is given a definite size, and that is load
            bearing rather than tidy.

            `SPHERE` is a fraction of the drawing, and `measure` turns it into
            pixels using this element's box — so the drawing has to fill this
            element exactly. It did not. The figure was sized by `h-full` inside
            an auto-height parent, which is an indefinite percentage and
            resolves to nothing, so the image fell back to its intrinsic 1024px
            and was then held to the box only by Tailwind's `max-width: 100%`.
            That happens to be the right answer on any viewport shorter than
            1024, which is most of them, and stops being one the moment the
            viewport is taller: the box keeps growing with `h-screen` and the
            drawing stops at 1024, so the measured circle walks down and right
            of the real sphere until it is sitting by her elbow.

            `absolute inset-0` gives the wrapper a definite height for `h-full`
            to resolve against, and `max-w-none` takes the preflight cap out of
            the sizing so the two can never disagree again. It is also still a
            positioned element, which is the other thing it is for: at exactly
            opacity 1 she stops being a stacking context of her own, and an
            unpositioned box would drop to the block-level paint step and be
            covered by the aperture above her.
          */}
          <motion.div
            className="absolute inset-0"
            style={{ opacity: figure, maskImage: mask, WebkitMaskImage: mask }}
          >
            {/*
              One drawing, chosen in JavaScript, rather than two with a `dark:`
              variant hiding one of them. `display: none` hides an image; it
              does not stop the browser fetching it, and these two are 247 and
              228 kilobytes — together the largest thing on the page, and half
              of it spent on a picture that could never be seen.

              `ProductMark` keeps both for a reason that does not reach here:
              its marks are in the prerendered HTML, so the theme is unknown at
              first paint and choosing in JS means drawing the wrong mark and
              swapping it a frame later. This module is lazily loaded, never
              prerendered, and she starts at opacity 0 and takes about a second
              to arrive. There is no first paint of hers to get wrong.

              `fetchpriority` is spread rather than written as a prop for the
              same reason the navbar spreads it: React 18 has no typed camelCase
              form and warns before falling back to this exact attribute anyway.
              Low, because she is a backdrop that arrives two seconds in and
              must not be queued ahead of the headline.
            */}
            <img
              src={dark ? mascotDark : mascotLight}
              alt=""
              width={2048}
              height={2048}
              decoding="async"
              {...{ fetchpriority: "low" }}
              className="athena-breath block h-full w-full max-w-none"
            />
          </motion.div>

          {/* The cool counter-light, under the warm key so the key wins
              wherever the two overlap. See RIM. */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              opacity: rimOpacity,
              backgroundImage: `radial-gradient(ellipse ${RIM.reach * 100}% ${
                RIM.reach * 100
              }% at ${RIM.at[0] * 100}% ${RIM.at[1] * 100}%, hsl(var(--field-cool) / 0.5) 0%, hsl(var(--field-cool) / 0.2) 30%, rgba(0,0,0,0) 82%)`,
              maskImage: `url(${dark ? mascotDark : mascotLight})`,
              maskSize: "100% 100%",
              WebkitMaskImage: `url(${dark ? mascotDark : mascotLight})`,
              WebkitMaskSize: "100% 100%",
            }}
          />

          {/* Masked to her drawing, so it lights the whole figure and nothing
              else. Under the halo below, because this is light on a surface and
              that one is light in the air. See CAST. */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              opacity: castOpacity,
              backgroundImage: `radial-gradient(ellipse ${CAST.reach * 100}% ${
                CAST.reach * 100
              }% at ${SPHERE.cx * 100}% ${SPHERE.cy * 100}%, hsl(var(--field-warm) / 0.62) 0%, hsl(var(--field-warm) / 0.26) 22%, rgba(0,0,0,0) 86%)`,
              /* Percentage radii on an `ellipse`, never `circle` — a circle may
                 only be given a length, and the wrong form is not a parse error
                 you are told about. The box is square, so they are a circle. */
              maskImage: `url(${dark ? mascotDark : mascotLight})`,
              maskSize: "100% 100%",
              WebkitMaskImage: `url(${dark ? mascotDark : mascotLight})`,
              WebkitMaskSize: "100% 100%",
            }}
          />

          {/* The glint, on the surface with the other two and so under the
              halo. See GLINT. */}
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              opacity: glintOpacity,
              backgroundImage: `radial-gradient(ellipse ${GLINT.reach[0] * 100}% ${
                GLINT.reach[1] * 100
              }% at ${GLINT.at[0] * 100}% ${GLINT.at[1] * 100}%, hsl(var(--field-cool) / 0.95) 0%, hsl(var(--field-cool) / 0.28) 26%, rgba(0,0,0,0) 100%)`,
              maskImage: `url(${drawing})`,
              maskSize: "100% 100%",
              WebkitMaskImage: `url(${drawing})`,
              WebkitMaskSize: "100% 100%",
            }}
          />

          {/* Above her, so it lights her. See GLOW. */}
          <motion.div
            className="pointer-events-none absolute mix-blend-screen"
            style={{
              left: `${SPHERE.cx * 100}%`,
              top: `${SPHERE.cy * 100}%`,
              width: `${SPHERE.r * 2 * GLOW.spread * 100}%`,
              aspectRatio: "1",
              translateX: "-50%",
              translateY: "-50%",
              opacity: glow,
              background:
                "radial-gradient(circle, hsl(var(--field-warm) / 0.85) 0%, hsl(var(--field-warm) / 0.26) 32%, transparent 70%)",
            }}
          />
        </motion.div>
      </div>
    </>
  );
};

export default CollisionReveal;
