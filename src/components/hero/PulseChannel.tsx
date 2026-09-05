import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { subscribeGlow } from "./glow";

/**
 * The collider's pulse, published to CSS as `--pulse`, 0..1.
 *
 * The site had two lit moments and a dark middle. The plane runs behind every
 * page and the closing panel's ball, halo and the light on her hand all breathe
 * with it — which is exactly why those three read as one object rather than
 * three effects at one place. Nothing between them was listening, so the hero
 * and the ending felt like one machine and the sections in between felt like a
 * different, well-made website.
 *
 * What listens now is the page's own structure: the 2px accent bar beside every
 * section eyebrow and the hairline rule under every section heading. Those two
 * marks are already on every band of every page, they are already `--steel`, and
 * they are already the smallest things on screen — which is the whole reason
 * this works at a level nobody consciously sees. It is not an animation of the
 * content. It is the room the content is in having a light in it.
 *
 * One subscription for the whole document rather than one per section. Thirty
 * of these marks on the homepage alone, and a React subscription each would be
 * thirty state updates a frame to move something by three percent of an alpha.
 * A custom property on the root element is read by CSS on every element that
 * mentions it, at no cost per element, and the write is a single `setProperty`
 * on a value the compositor is already reading.
 *
 * Zero is the resting value and the default, so this is additive by
 * construction: `--pulse` is declared `0` in the stylesheet, every consumer is
 * written as `rest + swing * var(--pulse)`, and a page with no plane, a browser
 * that never runs this effect, and a reader who asked for less motion all get
 * exactly the design that was there before. Nothing can dim by not being
 * subscribed.
 *
 * The enveloped signal rather than the raw pulse, and the same one she is lit
 * by — see glow.ts. The plane's own flare is much faster than it looks, and
 * structure that snaps on and off in four frames is a flicker; more to the
 * point, marks that ran on a different clock from the light in her hands would
 * be the exact failure this is meant to fix, one event arriving twice.
 *
 * That signal is the positive half only, for the reason the closing panel
 * gives: the renderer draws breath before an event, and structure that dims
 * just before a flash reads as a dropped frame rather than as anticipation.
 */
/**
 * How finely the value is written. See below.
 */
const STEPS = 32;

const PulseChannel = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    /*
     * Quantised, because a custom property on the root element is inherited by
     * every element under it, and the browser has to say so.
     *
     * Nothing about `var()` is free the way a transform is. Changing `--pulse`
     * on `:root` invalidates the computed style of the whole document —
     * measured on the homepage, 1,171 elements and 2.7ms of style recalculation
     * per write, of which about 2.2ms is the invalidation alone: an unregistered
     * custom property that nothing reads costs the same. Written every frame
     * that is a sixth of the frame budget on this machine, spent to move
     * fourteen hairlines by a hundredth of an alpha.
     *
     * A thirty-second is smaller than the smallest thing downstream can show.
     * The two consumers turn the full swing into 0.3 of an alpha on a one-pixel
     * rule and six pixels of shadow blur, so one step is 0.009 and 0.19px
     * respectively — under the resolution of a display, let alone an eye. The
     * decay crosses about twenty-eight of them on its way down, so an event
     * costs twenty-eight invalidations rather than ninety.
     *
     * Quantised rather than throttled, and rounded rather than transitioned,
     * for the same reason: the attack has to survive. The envelope this reads
     * rises to its peak in a single frame on purpose (see glow.ts), so anything
     * that spreads a change over time — a CSS transition on the consumers, a
     * timer here — would put the flash back exactly where the last pass took it
     * out of. Crossing twenty buckets at once is still one write, landing on
     * the frame it happened.
     */
    let last = -1;
    const stop = subscribeGlow((g) => {
      const q = Math.round(g * STEPS) / STEPS;
      if (q === last) return;
      last = q;
      root.style.setProperty("--pulse", q.toFixed(3));
    });
    return () => {
      stop();
      root.style.removeProperty("--pulse");
    };
  }, []);
  return null;
};

export default PulseChannel;
