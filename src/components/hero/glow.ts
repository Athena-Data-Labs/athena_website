import { subscribePulse } from "./reveal-timing";

/**
 * The pulse with a decay on it — what anything *lit by* an event should read,
 * as opposed to the event itself.
 *
 * `subscribePulse` publishes the plane's own brightness, and everything drawn
 * over the plane was following it instantly. That is right for the sphere, which
 * is the event, and wrong for every surface the event illuminates, because the
 * plane's flare is far quicker than it looks. Measured off `flare()` in
 * FieldRenderer: the strike is `2.6 * exp(-t * 7)`, a 143ms time constant, so
 * the pulse is at half strength 183ms after impact. The glint on her helmet then
 * squares it — a specular is not linear in the source — and squaring an
 * exponential halves its time constant: half gone in **79 milliseconds**, under
 * five frames at 60Hz. That is not a highlight catching an event. That is a
 * one-frame artefact, and it read as one.
 *
 * A peak-follower rather than a smoothed one, and the distinction is the whole
 * design. Smoothing both edges costs the peak: an attack slow enough to stretch
 * the tail cannot keep up with a strike that is already decaying, and simulated
 * against the real waveform it lost between a third and a half of the maximum —
 * a flare that is longer *and* dimmer, which is worse on both counts. Holding
 * the peak instead is what a light actually does. It arrives when it arrives,
 * and what takes time is going away.
 *
 * 0.55 seconds of release puts the half-life at 275ms against the raw signal's
 * 79, with the last two percent gone by 1.5s — comfortably inside the six
 * seconds between events, so nothing ever accumulates.
 *
 * One follower for the whole document, and that is deliberate beyond the cost.
 * The homepage's halo, the light thrown on her hand, the glint on her helmet,
 * the closing panel's version of all three, and the accent marks in the middle
 * sections are one light source seen five ways. Each computing its own envelope
 * would let them drift apart on a slow frame, and the failure mode of that is
 * precisely the thing this fixes — five things that are supposed to be one
 * event, arriving at five slightly different times.
 *
 * The positive half only. The plane draws breath before an event, and a surface
 * that darkens just before it is lit reads as a dropped frame rather than as
 * anticipation. Consumers that want the dip — the room's own breath in
 * CollisionReveal — subscribe to the raw pulse and say so.
 */
const RELEASE = 0.55;

/** Below this the light is off, and holding a raf to prove it is waste. */
const FLOOR = 0.002;

let level = 0;
const watchers = new Set<(v: number) => void>();
let raf = 0;
let last = 0;

const publish = () => {
  for (const w of watchers) w(level);
};

const step = (now: number) => {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now;
  level *= Math.exp(-dt / RELEASE);
  if (level < FLOOR) {
    level = 0;
    raf = 0;
    publish();
    return;
  }
  publish();
  raf = requestAnimationFrame(step);
};

let source: (() => void) | null = null;

const attach = () => {
  if (source) return;
  source = subscribePulse((v) => {
    const up = v > 0 ? v : 0;
    if (up <= level) return;
    // Straight to the peak: see above.
    level = up;
    publish();
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(step);
    }
  });
};

export const subscribeGlow = (fn: (v: number) => void) => {
  attach();
  fn(level);
  watchers.add(fn);
  return () => {
    watchers.delete(fn);
    if (watchers.size === 0) {
      source?.();
      source = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      level = 0;
    }
  };
};
