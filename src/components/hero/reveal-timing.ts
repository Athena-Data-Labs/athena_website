/**
 * What the reveal and the plane have to agree on, and nothing else.
 *
 * The two are a component and its own child, so this could all have been props —
 * except that the page has to set some of it, and `CollisionReveal` is loaded
 * lazily. A static import of a lazily-loaded module pulls it back into the main
 * chunk, which is the opposite of what the `lazy` around it is for. So the
 * shared numbers live here, in a module small enough that both chunks importing
 * it costs nothing.
 */

/**
 * Scroll progress, on the field's own clock, at which the collision has
 * finished contracting into her hands.
 *
 * The plane's exposure ramp shares it. The field is tuned quiet for a
 * full-viewport backdrop with copy read over it, and has to open up as it
 * shrinks — arriving late would leave the miniature at its dimmest exactly when
 * it is first looked at.
 */
export const CLOSED = 0.32;

/**
 * The scale the plane is currently displayed at, published by the reveal and
 * read by the plane itself.
 *
 * The field sizes its backing store from the window, because that is the size
 * it is drawn at. Once the reveal has contracted it, that stops being true: the
 * canvas still renders a full viewport — about 1.3M pixels on a laptop and four
 * times that on a retina screen — and roughly 7% of them survive the clip. The
 * rest are drawn and thrown away, every frame, for the life of the page.
 *
 * It is a signal rather than a prop because only the reveal knows the answer.
 * The plane cannot work it out: the contraction is gated on a fine pointer, on
 * the motion preference and on a breakpoint, and a plane that guessed wrong
 * would render a full-screen backdrop at a quarter resolution. No publisher
 * means no shrink, which is the safe default and the one every other page gets.
 */
let displayScale = 1;
const watchers = new Set<(scale: number) => void>();

export const setDisplayScale = (scale: number) => {
  const next = scale > 1 ? 1 : scale < 0.05 ? 0.05 : scale;
  // Sub-percent moves are below the resolution of anything downstream and are
  // not worth an allocation.
  if (Math.abs(next - displayScale) < 0.01) return;
  displayScale = next;
  for (const watcher of watchers) watcher(displayScale);
};

export const subscribeDisplayScale = (fn: (scale: number) => void) => {
  fn(displayScale);
  watchers.add(fn);
  return () => {
    watchers.delete(fn);
  };
};
