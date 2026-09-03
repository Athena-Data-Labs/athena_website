import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue } from "framer-motion";
import { hasFinePointer } from "@/lib/pointer";
import { useStageReady } from "@/lib/stage";
import { prefersReducedMotion } from "@/lib/motion";
import { useIsDark } from "@/lib/theme";
import { CLOSED, setDisplayScale } from "@/components/hero/reveal-timing";
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
const SPHERE = { cx: 739 / 1024, cy: 754 / 1024, r: 131 / 1024 };

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
 */
const BACKDROP = 0.38;

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

const CollisionReveal = ({ children }: { children?: ReactNode }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ready = useStageReady();
  const dark = useIsDark();
  /* Assigned by the effect below, called by the one after it. A ref rather than
     a dependency because `ready` flipping must not tear down and rebuild the
     listeners the reveal is running on. */
  const startIntro = useRef<(() => void) | null>(null);
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const clip = useMotionValue("none");
  const figure = useMotionValue(0);
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

    const apply = (p: number) => {
      const g = geom.current;
      if (!g.ready) return;
      const t = ease(span(p, 0, CLOSED));
      const midX = window.innerWidth / 2;
      const midY = window.innerHeight / 2;
      const cx = midX + (g.cx - midX) * t;
      const cy = midY + (g.cy - midY) * t;

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
      figure.set(BACKDROP * ease(span(p, FIGURE_IN[0], FIGURE_IN[1])));
    };

    /*
     * The denominator the field uses for its own camera dolly, so the
     * contraction and the pull-back are measuring the same thing.
     */
    const read = () =>
      clamp01(window.scrollY / Math.max(1, window.innerHeight * 0.9));

    const measure = () => {
      const box = el.getBoundingClientRect();
      if (box.width <= 0) return;
      const r = box.width * SPHERE.r * OVERSHOOT;
      geom.current = {
        ready: true,
        cx: box.left + box.width * SPHERE.cx,
        cy: box.top + box.height * SPHERE.cy,
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
      apply(current);
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
          apply(current);
          publish();
          frame = 0;
          return;
        }
        current = playhead(elapsed);
        apply(current);
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      current = damp(current, target, dt);
      if (Math.abs(target - current) < 0.0002) current = target;
      apply(current);
      if (current === target) {
        frame = 0;
        publish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = read();
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
      // it to render small.
      setDisplayScale(1);
    };
  }, [enabled, scale, x, y, clip, figure]);

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
        <div
          ref={wrapRef}
          className="absolute bottom-0 left-1/2 aspect-square h-screen -translate-x-1/2"
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
          <motion.div className="absolute inset-0" style={{ opacity: figure }}>
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
              width={1024}
              height={1024}
              decoding="async"
              {...{ fetchpriority: "low" }}
              className="block h-full w-full max-w-none"
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CollisionReveal;
