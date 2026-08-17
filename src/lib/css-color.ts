/**
 * Reads the theme's colour tokens back out of CSS so code that cannot use them
 * as CSS — the WebGL field, which needs float triplets in a uniform — still has
 * index.css as its single source of truth. Change a token there and the plane
 * follows; there is no second copy of the palette to forget.
 *
 * The tokens are stored the way Tailwind's `hsl(var(--x))` pattern requires:
 * bare, space-separated HSL channels ("210 40% 98%"), with no wrapper function
 * and sometimes a trailing "/ alpha" that is not our business here.
 */

type Rgb = [number, number, number];

/** HSL channels in 0..360 / 0..1 / 0..1 to sRGB in 0..1. */
const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = l - c / 2;
  const [r, g, b]: Rgb =
    hp < 1 ? [c, x, 0]
    : hp < 2 ? [x, c, 0]
    : hp < 3 ? [0, c, x]
    : hp < 4 ? [0, x, c]
    : hp < 5 ? [x, 0, c]
    : [c, 0, x];
  return [r + m, g + m, b + m];
};

/**
 * Resolve a custom property holding a bare HSL triplet to sRGB in 0..1.
 *
 * `fallback` covers the case where the property is missing or malformed —
 * during a hot reload that dropped the stylesheet, say. Returning black there
 * would paint the light theme's plane black, which is worse than being a shade
 * off, so callers pass the value they would have hard-coded.
 */
export const readHslToken = (name: string, fallback: Rgb): Rgb => {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  // "209 58% 29%" or "209 58% 29% / 0.16" — alpha is dropped.
  const parts = raw.split("/")[0].trim().split(/\s+/);
  if (parts.length < 3) return fallback;
  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1]) / 100;
  const l = Number.parseFloat(parts[2]) / 100;
  if (!Number.isFinite(h) || !Number.isFinite(s) || !Number.isFinite(l)) return fallback;
  return hslToRgb(h, s, l);
};
