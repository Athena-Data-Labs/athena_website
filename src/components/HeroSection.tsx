import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { scrollToSectionById } from "@/lib/scroll";

/* ── Fluctuating Neural Network ── */
const NeuralNetwork = () => {
  // 5 layers of nodes arranged left-to-right
  const layers = [
    [{ x: 30, y: 60 }, { x: 30, y: 140 }, { x: 30, y: 220 }, { x: 30, y: 300 }],
    [{ x: 130, y: 40 }, { x: 130, y: 110 }, { x: 130, y: 180 }, { x: 130, y: 250 }, { x: 130, y: 320 }],
    [{ x: 240, y: 70 }, { x: 240, y: 150 }, { x: 240, y: 230 }, { x: 240, y: 300 }],
    [{ x: 340, y: 50 }, { x: 340, y: 130 }, { x: 340, y: 210 }, { x: 340, y: 290 }, { x: 340, y: 340 }],
    [{ x: 440, y: 90 }, { x: 440, y: 180 }, { x: 440, y: 270 }],
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
  const pulseEdges = [0, 5, 12, 20, 30, 38, 45, 55, 62];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="flex h-full w-full items-center justify-center will-animate [perspective:1000px]"
    >
      <svg viewBox="0 0 470 380" className="w-full h-full [backface-visibility:hidden]" fill="none" preserveAspectRatio="xMidYMid meet">
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
        {/* Data flow pulses */}
        {pulseEdges.map((edgeIdx, i) => {
          const edge = edges[edgeIdx % edges.length];
          return (
            <motion.g key={`pulse-${i}`} className="[backface-visibility:hidden]">
              <motion.circle
                r="2.5"
                fill="hsl(var(--primary))"
                animate={{
                  cx: [edge.from.x, edge.to.x],
                  cy: [edge.from.y, edge.to.y],
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
            </motion.g>
          );
        })}
        {/* Nodes */}
        {allNodes.map((node, i) => (
          <g key={`n-${i}`}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              fill="hsl(var(--primary))"
              fillOpacity="0.15"
              animate={{ r: [4, 5.5, 4] }}
              transition={{ duration: 2.5 + (i % 2), delay: i * 0.08, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle 
              cx={node.x} cy={node.y} r="2" 
              fill="hsl(var(--primary))" 
              opacity="0.5"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5 + (i % 2), delay: i * 0.08, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative z-10 flex min-h-[86vh] items-center overflow-hidden border-b border-white/[0.06] pt-24 pb-12 md:pb-20 bg-[#0a0c10]">
      <div
        className="pointer-events-none absolute left-1/2 top-8 z-0 h-[150vh] w-[135vw] -translate-x-1/2 opacity-[0.4]"
        aria-hidden="true"
      >
        <NeuralNetwork />
      </div>

      <div className="container relative z-30 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-3.5 w-[2px] shrink-0 bg-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
            Business Intelligence · AI Agents · Data Science
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="max-w-4xl break-keep font-display text-5xl font-black leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl lg:text-[5.35rem]"
        >
          Transforming Data Into <span className="text-gradient">Intelligent Products</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="mt-5 mb-5 h-px w-24 origin-left bg-primary/40"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="max-w-2xl text-base leading-[1.72] text-slate-100/92 md:text-lg md:leading-[1.78]"
        >
          We deliver full-stack data science products, from ML-powered applications to
          predictive intelligence dashboards. Teams move from raw data to confident decisions
          with calm, reliable execution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          <Button variant="hero" size="lg" asChild>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSectionById("contact");
              }}
            >
              Talk to Us <ArrowRight className="ml-1" size={18} />
            </a>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSectionById("services");
              }}
            >
              See What We Deliver
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
