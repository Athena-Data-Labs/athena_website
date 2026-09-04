import { useState } from "react";
import darkHi from "@/assets/athena-agent.webp";
import lightHi from "@/assets/athena-agent-light.webp";
import darkLo from "@/assets/athena-agent-1024.webp";
import lightLo from "@/assets/athena-agent-light-1024.webp";
import wholeDarkHi from "@/assets/athena-agent-whole.webp";
import wholeLightHi from "@/assets/athena-agent-whole-light.webp";
import wholeDarkLo from "@/assets/athena-agent-whole-1024.webp";
import wholeLightLo from "@/assets/athena-agent-whole-light-1024.webp";

/**
 * Which plate to draw her from, and it is a resolution decision rather than a
 * bandwidth one.
 *
 * She is a 2048px drawing shown at 576 CSS pixels in the closing panel and 900
 * on the homepage. On a 2x screen those are 1152 and 1800 device pixels and the
 * 2048 plate is the right file — that is the whole reason the pipeline renders
 * at 2x. On a 1x screen they are 576 and 900, and the browser is being asked to
 * throw away three quarters of the image at paint time, with whatever filter it
 * has. Measured on the panel at 1x against the same crop at 2x, that is where
 * the blockiness on her nose and on the loose strand of hair comes from: the
 * plate is clean at both, and the 1x *composite* is not.
 *
 * So the downscale is done here instead, once, with Lanczos — which is the
 * argument the pipeline's own `--scale` comment already makes about moving the
 * resample out of the browser, applied at the other end of the same problem. A
 * 1x screen gets a plate drawn at its own size and never resamples it.
 *
 * One plate rather than `srcset`, because the drawing is used twice over: as the
 * image, and as the `mask-image` for the three light layers over it. A `srcset`
 * governs the first and not the second, so the two would disagree and a 1x
 * visitor would fetch both files.
 *
 * Read once, at mount. `devicePixelRatio` can change — dragging a window to
 * another monitor — but swapping the plate mid-life costs a fetch and a decode
 * to fix something nobody is looking for, and the masks would tear while it
 * landed.
 *
 * The choice is device pixels, not the ratio on its own, because the ratio was
 * only ever standing in for them. A phone is a 2x or 3x screen showing her at
 * about 450 CSS pixels — 900 device pixels at 2x, which the 1024 plate covers
 * exactly and the 2048 one oversamples by two and a half times for a hundred
 * kilobytes over a cellular connection. The same rule keeps a 2x laptop on the
 * large plate, where she is drawn at 1152, and puts a 3x phone back on it too.
 */
const BIG = 1100;
const useHiDpi = (cssPx?: number) =>
  useState(() => {
    if (typeof window === "undefined") return true;
    const box = cssPx ?? 900;
    return box * window.devicePixelRatio > BIG;
  })[0];
export const useMascotPlate = (dark: boolean) => {
  const hi = useHiDpi();
  if (dark) return hi ? darkHi : darkLo;
  return hi ? lightHi : lightLo;
};

/**
 * The same drawing with the sphere left in it.
 *
 * The cut exists so the homepage can contract a live collision into her hands,
 * and it costs the sphere everything the drawing gave it — the source has it
 * hatched in concentric rings with a hot off-centre core, and what fills the
 * hole in its place is a radial gradient, which is a flat disc with a rim on
 * it. On the homepage that is the right trade, because what shows through the
 * hole is a real simulation. Anywhere else it is a trade for nothing.
 *
 * A second pair of files rather than a flag on the first, because they are
 * different pictures and no page wants both: the homepage fetches the cut plate
 * and the closing panel fetches this one.
 */
export const useMascotWholePlate = (dark: boolean, cssPx?: number) => {
  const hi = useHiDpi(cssPx);
  if (dark) return hi ? wholeDarkHi : wholeDarkLo;
  return hi ? wholeLightHi : wholeLightLo;
};
