/**
 * One motion vocabulary for the whole site.
 *
 * Before this file there were seven different easing curves in use — quad-out,
 * expo-out, two in-outs and a back curve that overshoots — which is why the
 * page never felt like one object moving. Curves are the accent of an
 * interface: a reader cannot name them, but they can hear when three sections
 * in a row disagree.
 *
 * The house curve is a quintic ease-out. It leaves quickly and takes a long
 * time to settle, which is the whole trick behind motion that reads as calm
 * rather than slow: the element is already most of the way there before you
 * have finished noticing it moved, and the last few pixels arrive under their
 * own weight. Nothing overshoots. This site argues for careful work; bouncing
 * furniture undercuts that.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Symmetric curve for things that toggle between two resting states — a bar
 * changing height, a panel opening. An ease-out here reads as a snap, because
 * there is no distance for the tail to work with.
 */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/**
 * Durations, in seconds. The rule of thumb: the further a thing travels, the
 * longer it takes, and anything the reader is waiting on stays under a third
 * of a second.
 *
 * `reveal` is deliberately long. Section reveals are not feedback — nobody is
 * waiting for them — so they can afford the time, and it is the single change
 * that most makes a page feel unhurried.
 */
export const DUR = {
  /** Hover, focus, press — feedback, and it must not lag the input. */
  quick: 0.28,
  /** State changes the reader caused and is watching: menus, toggles. */
  base: 0.5,
  /** Scroll-triggered section reveals. */
  reveal: 0.8,
  /** Full-width or full-height moves, and anything crossing the viewport. */
  slow: 1.05,
} as const;

/** Delay between siblings in a staggered reveal. */
export const STAGGER = 0.09;

/**
 * Whether the reader has asked for less movement.
 *
 * Read at call time rather than cached: the setting is a system preference and
 * can change under a session that is already open, and a module-scope constant
 * would hold whatever was true when the bundle first evaluated. SSR-safe, so it
 * can be used as a `useState` initialiser during the prerender.
 */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
