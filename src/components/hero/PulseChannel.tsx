import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { subscribePulse } from "./reveal-timing";

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
 * Only the positive half of the signal, for the reason the closing panel gives:
 * the renderer draws breath before an event, and structure that dims just
 * before a flash reads as a dropped frame rather than as anticipation.
 */
const PulseChannel = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    const stop = subscribePulse((v) => {
      root.style.setProperty("--pulse", (v > 0 ? v : 0).toFixed(3));
    });
    return () => {
      stop();
      root.style.removeProperty("--pulse");
    };
  }, []);
  return null;
};

export default PulseChannel;
