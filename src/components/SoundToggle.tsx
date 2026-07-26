import { useEffect } from "react";
import { playHover, playSelect, setSoundEnabled, useSoundEnabled } from "@/lib/sound";

const BARS = [0.35, 0.85, 0.55, 1, 0.45];

/**
 * Opt-in interface sound. While it is on, one delegated pair of listeners
 * sonifies every link and button on the page — no per-component wiring.
 */
const SoundToggle = ({ className = "" }: { className?: string }) => {
  const enabled = useSoundEnabled();

  useEffect(() => {
    if (!enabled) return;
    const selector = 'a, button, [role="button"]';

    const onOver = (event: PointerEvent) => {
      if ((event.target as Element | null)?.closest?.(selector)) playHover();
    };
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.(selector)) playSelect();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
    };
  }, [enabled]);

  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn interface sound off" : "Turn interface sound on"}
      className={`group flex items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 transition-colors hover:text-white/75 ${className}`}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {BARS.map((height, i) => (
          <span
            key={i}
            className="w-[2px] origin-bottom bg-current transition-all duration-300"
            style={{
              height: enabled ? `${height * 12}px` : "2px",
              animation: enabled ? `sound-bar 900ms ${i * 110}ms ease-in-out infinite alternate` : undefined,
              color: enabled ? "hsl(var(--primary))" : undefined,
            }}
          />
        ))}
      </span>
      Sound {enabled ? "On" : "Off"}
    </button>
  );
};

export default SoundToggle;
