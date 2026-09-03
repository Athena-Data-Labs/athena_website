import { useEffect, useState } from "react";

/**
 * Whether the dark theme is live, read off the class the theme actually sets.
 *
 * `next-themes` toggles a `dark` class on <html>, and almost everything on this
 * site answers that with a `dark:` variant — two elements, one hidden. That is
 * the right answer for anything cheap, and the wrong one for an image: a hidden
 * <img> still has a src, and a browser fetches it. The pair of drawings behind
 * the collision reveal is nearly half a megabyte, and half of that was being
 * spent on a picture nobody could see.
 *
 * Read from the class rather than from `useTheme()` for the same reason
 * `AtmosphereField` reads its palette from `--background`: the class is what
 * the styling is actually keyed on, and watching the state that eventually
 * produces the class is a race against whoever applies it. Losing that race
 * here means fetching the wrong drawing and then fetching the right one.
 *
 * Switching theme at runtime does fetch the other drawing, once. That is the
 * correct trade: it costs a toggle nobody makes on most visits, and it saves
 * every visit that never toggles.
 */
export const useIsDark = () => {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setDark(el.classList.contains("dark"));
    // Once on mount as well: the class can land between the initial state and
    // the observer being attached.
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
};
