import { useEffect, useRef, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";
import { hasFinePointer, subscribePointer } from "@/lib/pointer";

type Props = {
  children: ReactNode;
  /** How far the element travels toward the cursor, as a fraction of the offset. */
  strength?: number;
  /** Extra reach beyond the element's own bounds, in px. */
  reach?: number;
  className?: string;
};

/**
 * Pulls its child toward the cursor on approach and springs back on exit.
 * Inert on touch and under reduced motion, where the pull has no referent.
 */
const Magnetic = ({ children, strength = 0.32, reach = 90, className = "" }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const config = { stiffness: 170, damping: 15, mass: 0.55 };
  const x = useSpring(0, config);
  const y = useSpring(0, config);

  useEffect(() => {
    if (!hasFinePointer()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return subscribePointer((px, py) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = px - (rect.left + rect.width / 2);
      const dy = py - (rect.top + rect.height / 2);
      const limit = Math.max(rect.width, rect.height) / 2 + reach;
      const distance = Math.hypot(dx, dy);

      if (distance > limit) {
        x.set(0);
        y.set(0);
        return;
      }
      const falloff = 1 - distance / limit;
      x.set(dx * strength * falloff);
      y.set(dy * strength * falloff);
    });
  }, [reach, strength, x, y]);

  return (
    <motion.span ref={ref} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.span>
  );
};

export default Magnetic;
