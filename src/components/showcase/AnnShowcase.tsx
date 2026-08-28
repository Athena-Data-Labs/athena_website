import { motion } from "framer-motion";
import annBuilderNetworkDark from "@/assets/ann-builder-illustration-dark.svg";
import annBuilderNetworkLight from "@/assets/ann-builder-illustration-light.svg";
import { DUR, EASE } from "@/lib/motion";

/**
 * ANN Builder Studio demo: the generated network visualization and the three
 * stages of the workflow. Naming and CTAs live in the page hero.
 */
const AnnShowcase = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: DUR.reveal, ease: EASE }}
  >
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
        <span className="h-3 w-[2px] shrink-0 bg-steel" />
        Generated Visualization
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/40">
        Rendered from a trained network
      </p>
    </div>

    <div className="relative overflow-hidden border border-foreground/[0.08] bg-surface">
      <img
        src={annBuilderNetworkLight}
        alt="Stylized neural network illustration for ANN Builder Studio"
        className="w-full object-cover dark:hidden"
        loading="lazy"
      />
      <img
        src={annBuilderNetworkDark}
        alt="Stylized neural network illustration for ANN Builder Studio"
        className="hidden w-full object-cover dark:block"
        loading="lazy"
      />
    </div>
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
      The live app now includes dataset preprocessing alongside data exploration and ANN training.
    </p>

    <div className="mt-8 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-3">
      {[
        {
          step: "01",
          title: "Input",
          body: "Upload CSV data, review quality, and clean missing values or duplicates before modeling.",
        },
        {
          step: "02",
          title: "Model",
          body: "Set hidden layers, neuron counts, and training parameters in a guided flow.",
        },
        {
          step: "03",
          title: "Outcome",
          body: "Evaluate performance, test new data, and export prediction results.",
        },
      ].map((cell) => (
        <div key={cell.step} className="bg-background p-6 md:p-7">
          <span className="font-mono text-[10px] tracking-[0.16em] text-foreground/20">{cell.step}</span>
          <p className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
            {cell.title}
          </p>
          <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{cell.body}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

export default AnnShowcase;
