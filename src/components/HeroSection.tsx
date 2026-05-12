import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { scrollToSectionById } from "@/lib/scroll";

/* ── Animated dot-grid background ── */
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
      animate={{ y: [0, 40] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

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
      className="flex items-center justify-center w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.8 }}
    >
      <svg viewBox="0 0 470 380" className="w-full h-full" fill="none" preserveAspectRatio="xMidYMid meet">
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
            transition={{ duration: 1, delay: 0.8 + i * 0.012, ease: "easeOut" }}
          />
        ))}
        {/* Data flow pulses */}
        {pulseEdges.map((edgeIdx, i) => {
          const edge = edges[edgeIdx % edges.length];
          return (
            <motion.circle
              key={`pulse-${i}`}
              r="2.5"
              fill="hsl(var(--primary))"
              animate={{
                cx: [edge.from.x, edge.to.x],
                cy: [edge.from.y, edge.to.y],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 1.8,
                delay: 2 + i * 0.7,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
            />
          );
        })}
        {/* Nodes */}
        {allNodes.map((node, i) => (
          <g key={`n-${i}`}>
            <motion.circle
              cx={node.x} cy={node.y} r="5"
              fill="hsl(var(--primary))"
              fillOpacity="0.15"
              animate={{ fillOpacity: [0.1, 0.35, 0.1], r: [4, 6, 4] }}
              transition={{ duration: 3 + (i % 3), delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx={node.x} cy={node.y} r="2" fill="hsl(var(--primary))" opacity="0.5" />
          </g>
        ))}
      </svg>
    </motion.div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }} />
      {/* Gold radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.03) 35%, transparent 65%)" }}
      />
      <GridBackground />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex items-center gap-3 justify-center lg:justify-start mb-6"
            >
              <div className="h-px w-8 bg-primary/50" />
              <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Business Intelligence · AI Agents · Data Science
              </p>
              <div className="h-px w-8 bg-primary/50" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="font-display text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Transform Data Into{" "}
              <span className="text-gradient">Intelligent</span>{" "}
              Products
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-5 mb-5 h-px w-24 bg-gradient-to-r from-primary/60 to-transparent origin-left mx-auto lg:mx-0"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="max-w-lg text-base text-muted-foreground md:text-lg leading-relaxed mx-auto lg:mx-0"
            >
              We deliver full-stack data science products, from ML-powered
              applications to predictive intelligence dashboards, including our live Athena
              Intelligence Dashboard, so teams can move from raw data to confident
              decisions with calm, reliable execution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
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
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
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
            </motion.div>
          </div>

          {/* Right: Neural network graphic */}
          <div className="relative hidden lg:flex items-center justify-center overflow-hidden" style={{ width: 420, height: 380 }}>
            <NeuralNetwork />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
