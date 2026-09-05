import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Stars } from "@/components/ReviewCard";
import { writtenReviews, reviewSummary } from "@/content";
import type { Review } from "@/content";
import { DUR, EASE } from "@/lib/motion";

/**
 * Copies of the list laid end to end. Five rather than the two a loop strictly
 * needs, because the wrap is only invisible while there is a full viewport of
 * track to the right of wherever the rail is resting — and a handful of narrow
 * cards is not much more than a laptop's width, never mind an ultrawide. Padding
 * the count is far cheaper than the alternative, which is measuring and
 * re-rendering the track whenever the window changes size.
 */
const COPIES = 5;

/** Pixels per second. Slow enough to read a card that drifts past on its own. */
const SPEED = 26;

/**
 * One review, compressed to the size of a thing you can read going past.
 *
 * Deliberately not ReviewCard. That card is for the places that print a review
 * in full and has the weight to match; a row of those is a wall of text whichever
 * way you turn it. This is the teaser: one sentence, a name, and where it was
 * left. Anyone who wants the whole thing follows the link above the rail.
 *
 * Nothing in here is focusable, which is what lets the duplicated copies be
 * hidden from assistive tech without creating a link a screen reader has been
 * told does not exist.
 */
const Bubble = ({ review, duplicate }: { review: Review; duplicate: boolean }) => (
  <figure
    /* No `h-full` here: the track already stretches its items, and a percentage
       height resolved against a container the same items are sizing comes out
       inconsistent — enough to leave the row of bottom borders visibly ragged. */
    className="flex w-[min(80vw,19rem)] shrink-0 flex-col justify-between border border-foreground/[0.09] bg-background p-6"
    aria-hidden={duplicate || undefined}
  >
    <div>
      <Stars />
      <blockquote className="mt-3.5 text-[13px] leading-[1.65] text-foreground/80">
        &ldquo;{review.excerpt}&rdquo;
      </blockquote>
    </div>

    <figcaption className="mt-5">
      <p className="text-[13px] font-semibold text-foreground">{review.author}</p>
      <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-meta-quiet">
        {[review.source, review.product?.name ?? review.org].filter(Boolean).join(" · ")}
      </p>
    </figcaption>
  </figure>
);

/**
 * Reviews on the homepage, as a slow rail of excerpts rather than a block of
 * prose. A visitor at the front door is deciding whether to keep reading at all,
 * and full-length reviews there are a paywall made of other people's paragraphs —
 * it reads as a wall and gets scrolled past whole.
 *
 * So the front door gets the compressed version, and About prints every review
 * at full length. That split is also why the cards here have their own borders
 * and real gaps between them: the fused hairline grid this site uses everywhere
 * else is right for a table of contents and wrong here, because cards sharing one
 * continuous edge stop reading as separate things and start reading as one slab.
 */
const ReviewRail = () => {
  const railRef = useRef<HTMLDivElement>(null);

  /* The repeated copies exist only to hide the seam in a loop. With the loop
     switched off they are the same handful of reviews printed over and over,
     which a reader scrolling the rail by hand runs straight into — so reduced
     motion gets one copy and an ordinary short scroller.

     Read in an effect rather than in the initial state because this component is
     prerendered: the build has no reduced-motion preference to honour, so the
     markup has to start at the looping count and narrow after hydration. */
  const [looping, setLooping] = useState(true);
  useEffect(() => {
    setLooping(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const copies = looping ? COPIES : 1;

  /* The drift is written to `scrollLeft` rather than played as a transform, so
     the rail stays a real scroll container: trackpad, touch and keyboard all
     work on it for free, and stopping the animation is enough to hand control
     over. A transform-based marquee has to reimplement all three.

     It yields on any sign of a reader — hover, drag, focus, tab out of the page,
     or the rail leaving the viewport (the homepage has a WebGL field to feed).
     WCAG 2.2.2 wants moving content pausable; hover and focus are that pause,
     and reduced motion never starts it at all. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let held = 0;
    let onScreen = true;
    let frame = 0;
    let last = performance.now();
    let releaseTimer = 0;

    /* The loop's geometry, re-measured every frame because it moves: a web font
       landing or a rotation changes it, and reading it live is cheaper than
       being wrong.

       `period` is the distance between a card and the same card one copy later,
       taken from the DOM rather than as scrollWidth / COPIES. Those are not the
       same number — the rail carries horizontal padding, which is counted once
       in scrollWidth and belongs to no copy — and dividing anyway leaves a
       residue that shows up as a visible jump every time round.

       `floor` is where the resting band starts. Keeping a whole copy in reserve
       behind the viewport is what lets a reader scroll backwards past the first
       card, but it is only affordable if the track is long enough to hold that
       reserve and still fill the screen ahead. A few narrow cards on a wide
       monitor are not, and the first version of this asked for the reserve
       anyway: scrollLeft was pushed past its own maximum, silently clamped, and
       the rail sat frozen at the far end. So when the reserve does not fit, the
       band starts at zero and scrolling back past the start is what gives. */
    const geometry = () => {
      const cards = rail.children;
      if (cards.length <= writtenReviews.length) return { period: 0, floor: 0 };
      const period =
        (cards[writtenReviews.length] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
      const reserveFits = period * 2 + rail.clientWidth <= rail.scrollWidth;
      return { period, floor: reserveFits ? period : 0 };
    };

    const hold = () => {
      held++;
      window.clearTimeout(releaseTimer);
    };
    // A flick keeps its inertia after the finger lifts; resuming into that
    // fights the reader for as long as the deceleration lasts.
    const release = (delay = 0) => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        held = Math.max(0, held - 1);
      }, delay);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50) / 1000;
      last = now;

      /* Shifting by exactly one period leaves the rail looking identical, so the
         reset is invisible wherever it happens. It runs even while paused, which
         is what catches a reader who scrolls off either end and re-settles the
         rail after a reflow moved the boundary under it. */
      const { period, floor } = geometry();
      if (period > 0) {
        if (rail.scrollLeft >= floor + period) rail.scrollLeft -= period;
        else if (rail.scrollLeft < floor) rail.scrollLeft += period;
      }

      if (held || !onScreen) return;
      rail.scrollLeft += SPEED * dt;
    };

    rail.scrollLeft = geometry().floor;
    frame = requestAnimationFrame(tick);

    const onRelease = () => release(600);
    const onWheel = () => {
      hold();
      release(1200);
    };
    const onVisibility = () => (document.hidden ? hold() : release());

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(rail);

    rail.addEventListener("pointerenter", hold);
    rail.addEventListener("pointerleave", onRelease);
    rail.addEventListener("pointerdown", hold);
    rail.addEventListener("pointerup", onRelease);
    rail.addEventListener("touchstart", hold, { passive: true });
    rail.addEventListener("touchend", onRelease);
    rail.addEventListener("wheel", onWheel, { passive: true });
    rail.addEventListener("focusin", hold);
    rail.addEventListener("focusout", onRelease);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(releaseTimer);
      observer.disconnect();
      rail.removeEventListener("pointerenter", hold);
      rail.removeEventListener("pointerleave", onRelease);
      rail.removeEventListener("pointerdown", hold);
      rail.removeEventListener("pointerup", onRelease);
      rail.removeEventListener("touchstart", hold);
      rail.removeEventListener("touchend", onRelease);
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("focusin", hold);
      rail.removeEventListener("focusout", onRelease);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* A mouse with no scrollbar to grab has no other way through the rail, so the
     cards themselves are the handle. Dragging is not the primary affordance —
     the drift already shows there is more — it is the fallback for the one input
     that would otherwise be stuck. */
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !railRef.current) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: railRef.current.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!drag.current.active || !rail) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    if (drag.current.moved) rail.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = () => {
    drag.current.active = false;
  };

  return (
    <section
      id="reviews"
      /* Wider than its neighbours, with ProofTeaser — the page's two peaks. See
         the note there. This was one step *tighter* than everything else while
         the section was cramped, which made it the only band on the homepage
         that did not line up with anything. */
      className="relative z-10 overflow-hidden border-b border-foreground/[0.06] panel py-16 md:py-28"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DUR.reveal, ease: EASE }}
          /* Same shape as every other section header on this page: eyebrow,
             heading, rule, and a small-caps link off to the right. The first
             version of this shrank the heading and restyled the link to suit a
             lighter section, which read as a different site rather than a lighter
             section — a page's headings have to be one scale to have a rhythm. */
          className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-meta">
              <span className="h-3 w-[2px] shrink-0 accent-bar" />
              Reviews
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              The Part We Don&rsquo;t Write
            </h2>
            <div className="mt-3 h-px w-16 accent-rule" />
            <div className="mt-4 flex items-center gap-2.5">
              <Stars />
              <span className="font-mono text-xs tracking-[0.06em] text-steel">
                {reviewSummary.average.toFixed(1)} · {reviewSummary.ratingCount} ratings
              </span>
            </div>
          </div>

          {/* The excerpts are the reason this link is not optional: the rail
              quotes one sentence each, and the page it points at is where the
              claim that nothing was cherry-picked can actually be checked. */}
          <Link
            to="/about#reviews"
            data-umami-event="home-all-reviews"
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel transition-colors hover:text-foreground"
          >
            Read Them In Full <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Full-bleed and masked at both edges rather than cut: a card sliding out
          under a fade reads as a rail that continues, where a hard edge reads as
          a card that got clipped. */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: DUR.reveal }}
        /* The ring lives out here, on the unmasked box. See .focus-rail: the
           rail's own outline is eaten by the mask below and by the section's
           overflow clip, so this is the element that can actually show one. */
        className="focus-rail"
      >
        <div className="mask-edges-x">
          <div
            ref={railRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="scrollbar-none flex items-stretch gap-4 overflow-x-auto overscroll-x-contain px-6 py-1 outline-none"
            /* Not a listbox or a carousel widget: a scrollable region of prose,
               which is what `region` plus a name announces. */
            role="region"
            aria-label={`${reviewSummary.writtenCount} five-star reviews`}
            tabIndex={0}
          >
            {Array.from({ length: copies }).flatMap((_, copy) =>
              writtenReviews.map((review) => (
                <Bubble key={`${copy}-${review.author}`} review={review} duplicate={copy > 0} />
              )),
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ReviewRail;
