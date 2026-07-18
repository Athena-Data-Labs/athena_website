import { motion } from "framer-motion";

/**
 * Transparent reveal band: a window onto the fixed NeuralBackdrop plane.
 * The band itself holds only a thin strip of foreground copy, so as the
 * opaque sections above and below slide past, the stationary background
 * shows through — layered composition doing the depth work, no shadows.
 */
const SignalBand = () => (
  <section className="relative z-10 border-b border-white/[0.06] bg-transparent py-20 md:py-28">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
          Athena // Signal
        </span>
        <p className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Wisdom through <span className="text-gradient">data</span>.
        </p>
        <div className="mt-5 h-px w-16 bg-primary/40" />
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Every product on this page runs in production. The network behind this text
          is the same discipline: signals in, decisions out.
        </p>
      </motion.div>
    </div>
  </section>
);

export default SignalBand;
