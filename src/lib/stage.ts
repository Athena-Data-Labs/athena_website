import { useSyncExternalStore } from "react";

/**
 * One bit of shared state: has the preloader handed the stage over yet?
 *
 * The hero's WebGL aperture, the headline reveal and the navbar all key their
 * entrance off the same moment, and they are siblings in the tree — a tiny
 * store beats threading a prop through the page shell.
 */

let ready = false;
const listeners = new Set<() => void>();

const snapshot = () => ready;

export const markStageReady = () => {
  if (ready) return;
  ready = true;
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const useStageReady = () => useSyncExternalStore(subscribe, snapshot, () => true);

/**
 * Whether this document arrived with the page already rendered into it.
 *
 * Every route ships prerendered HTML now (scripts/prerender.mjs), so on a cold
 * load the real page is painted before the bundle has finished downloading.
 * That changes what the preloader is. It exists to put something deliberate in
 * front of a blank first paint; when the first paint is the site itself, a
 * curtain dropping over it afterwards is not an intro, it is an interruption —
 * and the slower the connection, the longer the content sits there before it
 * gets covered.
 *
 * Set by main.tsx from the one place that can still see the evidence: the
 * mount point, before createRoot empties it.
 */
let servedPrerendered = false;

export const markServedPrerendered = () => {
  servedPrerendered = true;
};

export const wasServedPrerendered = () => servedPrerendered;

/** True after the first homepage visit in this tab — the preloader is a first-impression device, not a toll booth. */
export const introAlreadyPlayed = () => {
  try {
    return sessionStorage.getItem("athena-intro") === "1";
  } catch {
    return false;
  }
};

export const markIntroPlayed = () => {
  try {
    sessionStorage.setItem("athena-intro", "1");
  } catch {
    /* private mode — replaying the intro is an acceptable outcome */
  }
};
