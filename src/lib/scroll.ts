const DEFAULT_DURATION_MS = 800;
const DEFAULT_NAVBAR_OFFSET_PX = 72;

function smoothScrollTo(targetY: number, duration = DEFAULT_DURATION_MS) {
  // The CSS `scroll-behavior` override in the reduced-motion block never reached
  // this path: it is a hand-rolled rAF animation, so it kept flying the page
  // 800ms down the document for the users who asked for exactly the opposite.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, targetY);
    return;
  }

  const startY = window.scrollY;
  const diff = targetY - startY;
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, startY + diff * ease);
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export function scrollToTop() {
  smoothScrollTo(0);
}

export function scrollToSectionById(sectionId: string, offset = DEFAULT_NAVBAR_OFFSET_PX) {
  const normalizedId = sectionId.replace(/^#/, "");
  const el = document.getElementById(normalizedId);
  if (!el) return false;

  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  smoothScrollTo(top);
  return true;
}
