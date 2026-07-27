/**
 * Recovery for the one failure mode a code-split SPA cannot avoid.
 *
 * Every deploy writes new content-hashed chunk filenames. A browser holding a
 * cached index.html will ask for chunks that no longer exist, the dynamic
 * import rejects, and React tears down the tree — header, footer, everything —
 * leaving a page that stays blank until the visitor thinks to hard-refresh.
 *
 * A stale document is fixed by fetching a fresh one, so that is what we do,
 * once. The timestamp guard is what stops "reload on failure" from becoming a
 * reload loop when the chunk is genuinely gone: a second failure inside the
 * window falls through to the caller's error UI instead.
 */

export const CHUNK_ERROR =
  /Loading chunk|Loading CSS chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

const RELOAD_KEY = "athena:chunk-reload-at";
const RELOAD_WINDOW_MS = 15_000;

/** Reloads at most once per window. Returns true only if a reload was started. */
export const recoverFromStaleChunk = () => {
  let last = 0;
  try {
    last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
  } catch {
    // Blocked storage means no loop guard is possible, so do not reload at all.
    return false;
  }
  if (Date.now() - last < RELOAD_WINDOW_MS) return false;
  try {
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
};
