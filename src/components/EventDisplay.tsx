import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * A collision event display: tracks curving out of a single vertex, the way a
 * detector draws them. Generated, not drawn by hand — each track is a circular
 * arc of a different radius and sign, which is what a charged particle actually
 * traces in a magnetic field.
 *
 * The two papers this sits above are on Λ hyperon spin polarization and fluid
 * vorticity in heavy-ion collisions, so the figure is the subject matter rather
 * than decoration.
 */

const TRACKS = [
  { angle: -78, curvature: 0.55, length: 62, gold: false },
  { angle: -44, curvature: -0.32, length: 74, gold: true },
  { angle: -12, curvature: 0.22, length: 82, gold: false },
  { angle: 16, curvature: -0.48, length: 70, gold: false },
  { angle: 43, curvature: 0.36, length: 78, gold: true },
  { angle: 74, curvature: -0.26, length: 58, gold: false },
  { angle: 112, curvature: 0.42, length: 66, gold: false },
  { angle: 148, curvature: -0.6, length: 54, gold: false },
  { angle: 186, curvature: 0.3, length: 72, gold: false },
  { angle: 222, curvature: -0.38, length: 60, gold: true },
  { angle: 258, curvature: 0.5, length: 56, gold: false },
  { angle: 302, curvature: -0.24, length: 76, gold: false },
];

const VERTEX = { x: 26, y: 46 };

/** Quadratic arc: the control point is offset perpendicular to the track by its curvature. */
const trackPath = ({ angle, curvature, length }: (typeof TRACKS)[number]) => {
  const rad = (angle * Math.PI) / 180;
  const endX = VERTEX.x + Math.cos(rad) * length;
  const endY = VERTEX.y + Math.sin(rad) * length;
  const midX = VERTEX.x + Math.cos(rad) * length * 0.5;
  const midY = VERTEX.y + Math.sin(rad) * length * 0.5;
  const controlX = midX + Math.sin(rad) * length * curvature * 0.5;
  const controlY = midY - Math.cos(rad) * length * curvature * 0.5;
  return `M ${VERTEX.x} ${VERTEX.y} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
};

const EventDisplay = () => {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 120 92"
      className="h-auto w-full"
      fill="none"
      aria-hidden="true"
    >
      {TRACKS.map((track, i) => (
        <motion.path
          key={i}
          d={trackPath(track)}
          stroke={track.gold ? "hsl(var(--primary))" : "hsl(213 30% 62%)"}
          strokeOpacity={track.gold ? 0.75 : 0.3}
          strokeWidth={track.gold ? 0.9 : 0.7}
          strokeLinecap="round"
          initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
          whileInView={reduced ? undefined : { pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, delay: 0.2 + i * 0.045, ease: EASE }}
        />
      ))}
      {/* The interaction point */}
      <circle cx={VERTEX.x} cy={VERTEX.y} r="2.6" fill="hsl(var(--primary))" fillOpacity="0.18" />
      <circle cx={VERTEX.x} cy={VERTEX.y} r="1.1" fill="hsl(var(--primary))" />
    </svg>
  );
};

export default EventDisplay;
