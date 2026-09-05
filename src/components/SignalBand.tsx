import { motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

/**
 * Transparent reveal band: a window onto the fixed AtmosphereField plane.
 * The band itself holds only a thin strip of foreground copy, so as the
 * opaque sections above and below slide past, the stationary background
 * shows through — layered composition doing the depth work, no shadows.
 */
const SignalBand = () => (
  <section
    id="signal-band"
    className="relative z-10 bg-transparent py-12 md:py-28"
  >
    {/* The band is a window, so the copy sits on whatever the plane is doing
        behind it — and the brightest pass of the collision runs straight
        through the middle of the paragraph. A soft pool of page colour, masked
        to nothing at the edges, buys the text its contrast back without
        putting a panel here and closing the window. */}
    <div
      className="pointer-events-none absolute inset-0 z-0 bg-background/50 [mask-image:radial-gradient(ellipse_46%_62%_at_50%_50%,black_35%,transparent)]"
      aria-hidden="true"
    />

    <div className="relative z-10 container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: DUR.reveal, ease: EASE }}
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-meta-quiet">
          Athena // Signal
        </span>
        <p className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Wisdom through <span className="text-gradient">data</span>.
        </p>
        <div className="mt-5 h-px w-16 accent-rule" />
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Every product on this page runs in production. The collision behind this text
          is the same discipline: you never observe the answer, you reconstruct it from
          what it left behind.
        </p>
      </motion.div>
    </div>
  </section>
);

export default SignalBand;
