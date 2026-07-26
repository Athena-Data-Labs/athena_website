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
