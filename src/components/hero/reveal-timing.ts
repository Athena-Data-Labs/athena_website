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

/**
 * How bright the loudest live event in the plane is, **-1..1**.
 *
 * Published by whoever is driving the field, read by whoever is drawing over
 * it. It exists so that the hand holding the sphere can be lit by what is
 * inside it: a light source that throws nothing on the fingers around it is the
 * clearest sign that two pictures were pasted together rather than one being
 * lit by the other.
 *
 * Negative is the field drawing breath before an event — see `flare` in
 * FieldRenderer. This floor used to be 0, which meant every anticipation the
 * renderer produced was silently thrown away here, at the last step before
 * anyone could see it: measured on the page, the light sat at exactly its rest
 * value right up to the frame it flashed. Consumers add this to a base and
 * scale it, so a floor of -1 is what the tightest of them can take and still
 * be a valid opacity.
 *
 * Written every frame, so the epsilon is not a nicety — without it every frame
 * of the whole page's life would push a style write through for a change no eye
 * could resolve.
 */
let pulse = 0;
const pulseWatchers = new Set<(v: number) => void>();

export const setPulse = (v: number) => {
  const next = v > 1 ? 1 : v < -1 ? -1 : v;
  if (Math.abs(next - pulse) < 0.004) return;
  pulse = next;
  for (const watcher of pulseWatchers) watcher(pulse);
};

export const subscribePulse = (fn: (v: number) => void) => {
  fn(pulse);
  pulseWatchers.add(fn);
  return () => {
    pulseWatchers.delete(fn);
  };
};

/**
 * Whether anything is actually contracting the plane right now.
 *
 * Distinct from the scale, and the distinction is a bug I shipped. The page
 * declares `contractOver` on the plane, but the reveal only runs behind a fine
 * pointer, the motion preference and a breakpoint — so on a phone, or for
 * anyone who asked for less motion, the plane was still being told the scroll
 * had contracted it while it was in fact still full-bleed behind the copy. It
 * released the guard that keeps it off the headline and opened its exposure, on
 * exactly the screens where body text sits on top of it.
 *
 * So the plane asks whether it is being held rather than assuming it from a
 * prop. Nobody holding it is the safe answer and the one every other page gets.
 */
let revealActive = false;
const activeWatchers = new Set<(v: boolean) => void>();

export const setRevealActive = (v: boolean) => {
  if (v === revealActive) return;
  revealActive = v;
  for (const watcher of activeWatchers) watcher(revealActive);
};

export const subscribeRevealActive = (fn: (v: boolean) => void) => {
  fn(revealActive);
  activeWatchers.add(fn);
  return () => {
    activeWatchers.delete(fn);
  };
};
