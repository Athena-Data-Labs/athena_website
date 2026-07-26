import { useSyncExternalStore } from "react";

/**
 * Optional interface sound: a few synthesized tones, no audio files.
 *
 * Off by default and remembered per browser. Nothing here ever plays before the
 * visitor has explicitly asked for it — a site that makes noise on arrival is
 * not a premium experience, it is an ad.
 */

const STORAGE_KEY = "athena-sound";

let enabled = false;
let context: AudioContext | null = null;
let master: GainNode | null = null;
const listeners = new Set<() => void>();

try {
  enabled = localStorage.getItem(STORAGE_KEY) === "on";
} catch {
  enabled = false;
}

const ensureContext = () => {
  if (context) return context;
  const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  master = context.createGain();
  master.gain.value = 0.22;
  master.connect(context.destination);
  return context;
};

/**
 * Notes are always scheduled a beat ahead of the clock. Scheduling at exactly
 * `currentTime` races the audio thread: by the time the graph is built the
 * start time is already in the past, the attack ramp has notionally finished,
 * and the note is dropped silently.
 */
const LEAD = 0.02;

type ToneSpec = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  glide?: number;
  delay?: number;
};

const schedule = (
  ctx: AudioContext,
  { frequency, duration, type = "sine", gain = 1, glide = 0, delay = 0 }: ToneSpec
) => {
  if (!master) return;

  const start = ctx.currentTime + LEAD + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(frequency + glide, start + duration);

  // Short attack, exponential tail — anything blunter clicks.
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

const tone = (spec: ToneSpec) => {
  const ctx = ensureContext();
  if (!ctx) return;
  // A suspended context has a frozen clock, so anything scheduled against it
  // lands in the past once it resumes. Wait for the resume, then play.
  if (ctx.state === "suspended") {
    void ctx.resume().then(() => schedule(ctx, spec));
    return;
  }
  schedule(ctx, spec);
};

export const soundEnabled = () => enabled;

export const setSoundEnabled = (next: boolean) => {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    /* storage blocked — the setting is just per-session then */
  }
  if (next) {
    ensureContext();
    // A rising fifth, so switching it on is unmistakably audible rather than a
    // blip you might not notice and conclude the toggle is broken.
    tone({ frequency: 523.25, duration: 0.11, gain: 0.7 });
    tone({ frequency: 783.99, duration: 0.18, gain: 0.5, delay: 0.085, type: "triangle" });
  }
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useSoundEnabled = () => useSyncExternalStore(subscribe, soundEnabled, () => false);

export const playHover = () => {
  if (!enabled) return;
  tone({ frequency: 1180, duration: 0.055, gain: 0.22, type: "triangle" });
};

export const playSelect = () => {
  if (!enabled) return;
  tone({ frequency: 520, duration: 0.09, gain: 0.5 });
  tone({ frequency: 1040, duration: 0.14, gain: 0.3, delay: 0.045, type: "triangle" });
};
