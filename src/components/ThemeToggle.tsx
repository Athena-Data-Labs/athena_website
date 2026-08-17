import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Light/dark switch.
 *
 * Dark stays the default and the storage key is unchanged, so anyone who has
 * been here before sees exactly what they saw last time; light is an option
 * they opt into, not a change made on their behalf.
 *
 * Rendered as a placeholder until mounted. next-themes cannot know the stored
 * choice during SSR or during the prerendered first paint, so drawing the sun
 * or the moon before hydration means drawing the wrong one and swapping it a
 * frame later — the flicker this component exists to avoid.
 */
const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Switch to ${next} theme` : "Switch theme"}
      title={mounted ? `Switch to ${next} theme` : undefined}
      data-umami-event="toggle-theme"
      /* No box. A bordered square in the nav bar reads as a third button
         competing with the CTA, for a control nobody uses twice; the glyph
         alone is enough, and it gives the width back to the nav. Still a
         44px hit area on touch via the negative margin, which costs no
         layout width. */
      className={`group -mx-1.5 inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      {/* Both glyphs are always in the DOM; only opacity and scale change, so
          the swap is one composited transition rather than a re-mount. */}
      <span className="relative block h-4 w-4">
        <SunIcon
          className={`absolute inset-0 h-4 w-4 transition-[opacity,transform] duration-200 ${
            mounted && !isDark ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 h-4 w-4 transition-[opacity,transform] duration-200 ${
            !mounted || isDark ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
      </span>
    </button>
  );
};

const SunIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export default ThemeToggle;
