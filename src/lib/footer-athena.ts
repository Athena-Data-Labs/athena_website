import { useEffect, useState } from "react";
import { subscribeRevealActive } from "@/components/hero/reveal-timing";

/** The breakpoint below which she is not drawn at the footer — or fetched. */
const WIDE = "(min-width: 1024px)";

/**
 * Whether she is drawn at the foot of this page at all.
 *
 * Exported because the footer has to know too: the room she is revealed into,
 * and the extra base padding the fade needs, are both hers, and a page that is
 * not showing her should not be carrying eighty pixels of empty floor for her
 * either.
 */
export const useAthenaAtFooter = () => {
  /*
   * The width gate is why the drawing is chosen in JavaScript rather than
   * hidden with `lg:block`: `display: none` hides a picture, it does not call
   * off the fetch, and this one is three hundred kilobytes. Read synchronously
   * at mount so no paint lands on the wrong side of the answer, and watched
   * afterwards because a window is a thing people drag.
   */
  const [wide, setWide] = useState(
    () => typeof window === "undefined" || window.matchMedia(WIDE).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /*
   * And not where the page already has her.
   *
   * The homepage carries her the whole way down as a backdrop and ends with a
   * footer like every other page — so this drew a second Athena over the first,
   * at a different size and a different crop, and the last thing on the site
   * was a double exposure.
   *
   * Asked rather than assumed from the route. `revealActive` is the plane's own
   * question — is anything contracting me — and it is already false on a
   * homepage where the reveal declined to run, behind a coarse pointer or a
   * narrow window. Those are exactly the cases where the homepage has no figure
   * of its own and should get this one.
   */
  const [taken, setTaken] = useState(false);
  useEffect(() => subscribeRevealActive(setTaken), []);

  return wide && !taken;
};
