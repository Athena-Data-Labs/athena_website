import { motion } from "framer-motion";

/* ── Fluctuating Neural Network (moved from HeroSection) ── */
const NeuralNetwork = () => {
  // 5 layers of nodes arranged left-to-right
  const layers = [
    [{ x: 40, y: 70 }, { x: 40, y: 150 }, { x: 40, y: 230 }, { x: 40, y: 310 }],
    [{ x: 145, y: 45 }, { x: 145, y: 120 }, { x: 145, y: 195 }, { x: 145, y: 270 }, { x: 145, y: 345 }],
    [{ x: 255, y: 75 }, { x: 255, y: 155 }, { x: 255, y: 235 }, { x: 255, y: 315 }],
    [{ x: 365, y: 50 }, { x: 365, y: 125 }, { x: 365, y: 200 }, { x: 365, y: 275 }, { x: 365, y: 350 }],
    [{ x: 475, y: 75 }, { x: 475, y: 155 }, { x: 475, y: 235 }, { x: 475, y: 315 }],
    [{ x: 585, y: 45 }, { x: 585, y: 120 }, { x: 585, y: 195 }, { x: 585, y: 270 }, { x: 585, y: 345 }],
    [{ x: 690, y: 90 }, { x: 690, y: 200 }, { x: 690, y: 310 }],
  ];

  const allNodes = layers.flat();

  // Build edges between consecutive layers
  const edges: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) {
      for (const b of layers[l + 1]) {
        edges.push({ from: a, to: b });
      }
    }
  }

  // Pick a subset for animated pulses
  const pulseEdges = [2, 9, 18, 27, 36, 48, 60, 72, 84, 96, 105, 112];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="flex h-full w-full items-center justify-center will-animate [perspective:1000px]"
    >
      <svg viewBox="0 0 720 400" className="w-full h-full [backface-visibility:hidden]" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Edges */}
        {edges.map((edge, i) => (
          <motion.line
            key={`e-${i}`}
            x1={edge.from.x} y1={edge.from.y}
            x2={edge.to.x} y2={edge.to.y}
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            strokeOpacity="0.08"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.008, ease: "easeOut" }}
            className="[backface-visibility:hidden]"
          />
        ))}
        {/* Data flow pulses — animate transform (GPU) instead of cx/cy (paint) */}
        {pulseEdges.map((edgeIdx, i) => {
          const edge = edges[edgeIdx % edges.length];
          return (
            <motion.circle
              key={`pulse-${i}`}
              cx={edge.from.x}
              cy={edge.from.y}
              r="2.5"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0 }}
              animate={{
                x: [0, edge.to.x - edge.from.x],
                y: [0, edge.to.y - edge.from.y],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 1.4,
                delay: 1.5 + i * 0.5,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
          );
        })}
        {/* Nodes — static glow + cheap opacity pulse (no geometry animation) */}
        {allNodes.map((node, i) => (
          <g key={`n-${i}`}>
            <circle cx={node.x} cy={node.y} r="4.5" fill="hsl(var(--primary))" fillOpacity="0.15" />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="2"
              fill="hsl(var(--primary))"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.6 + (i % 3), delay: i * 0.08, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

/**
 * Fixed full-viewport background plane for the homepage — the deepest layer of
 * the composition. It never scrolls: opaque content sections slide over it,
 * and transparent sections (the hero, the signal band) act as windows onto it.
 * Rendered outside any transformed ancestor so `fixed` binds to the viewport.
 */
const NeuralBackdrop = () => (
  <div className="pointer-events-none fixed inset-0 z-0 bg-[#0a0c10]" aria-hidden="true">
    {/* One deliberate light source at the top edge */}
    <div className="absolute left-1/2 top-0 h-[420px] w-[140vw] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,hsl(40_75%_60%/0.07),transparent_70%)]" />
    <div className="absolute inset-0 opacity-[0.45]">
      <NeuralNetwork />
    </div>
  </div>
);

export default NeuralBackdrop;
