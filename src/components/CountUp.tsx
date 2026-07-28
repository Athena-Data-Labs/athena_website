import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type Props = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Counts a figure up once, when it first comes into view.
 *
 * Written straight to the DOM node rather than through state — a re-render per
 * frame for a number that is only decoration is a bad trade. Reduced motion and
 * the no-JS path both get the final figure immediately.
 */
const CountUp = ({ to, decimals = 0, prefix = "", suffix = "", className }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduced) {
      node.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        node.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals, prefix, suffix, reduced]);

  return (
    /* Tabular figures: Inter's proportional digits are not the same width, so a
       number counting through them wobbles as it climbs — and being set at
       display size in a stat grid, it takes the label under it along. */
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {/* Server/first paint and the reduced-motion path show the final figure. */}
      {`${prefix}${to.toFixed(decimals)}${suffix}`}
    </span>
  );
};

export default CountUp;
