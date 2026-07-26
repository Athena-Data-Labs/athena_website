type PointerListener = (x: number, y: number) => void;

const listeners = new Set<PointerListener>();

let pointerX = -9999;
let pointerY = -9999;
let frame = 0;
let bound = false;

const flush = () => {
  frame = 0;
  for (const listener of listeners) listener(pointerX, pointerY);
};

const onMove = (event: PointerEvent) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!frame) frame = requestAnimationFrame(flush);
};

/**
 * One pointermove listener for the whole page, coalesced to a frame.
 *
 * The cursor, the magnetic buttons, the headline's weight response and the
 * WebGL plane all track the same pointer; without this they would each install
 * their own listener and each do their own layout reads on the same event.
 */
export const subscribePointer = (listener: PointerListener) => {
  listeners.add(listener);
  if (!bound) {
    window.addEventListener("pointermove", onMove, { passive: true });
    bound = true;
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && bound) {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      bound = false;
    }
  };
};

export const pointerPosition = () => ({ x: pointerX, y: pointerY });

/** Fine pointers only: none of the cursor work should run on touch. */
export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
