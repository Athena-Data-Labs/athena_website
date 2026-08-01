/**
 * The two button shapes used for calls to action, in one place.
 *
 * These were copied inline into every component that needed a button, which is
 * how the product heroes, the pricing bands and the error boundary ended up
 * three slightly different sizes. A CTA should look the same wherever it is.
 *
 * `py-[15px]` on a `text-xs` (16px) line box comes out at 46px; the height is
 * written explicitly so images — the Apple App Store badge, specifically — can
 * be pinned to the same figure instead of eyeballed.
 */
export const CTA_HEIGHT = "h-[46px]";

const base = `group inline-flex ${CTA_HEIGHT} items-center gap-2 px-7 text-xs font-semibold uppercase tracking-[0.14em] transition-colors`;

/** Filled. One per page region: the thing we most want the reader to do. */
export const CTA_PRIMARY = `${base} bg-primary text-primary-foreground hover:bg-primary/90`;

/** Outlined. The alternative, and never more than one alongside a primary. */
export const CTA_SECONDARY = `${base} border border-white/15 text-foreground hover:border-steel/50 hover:text-steel`;
