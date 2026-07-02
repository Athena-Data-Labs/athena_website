import { motion } from "framer-motion";
import { BrainCircuit, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import annBuilderNetworkDark from "@/assets/ann-builder-illustration-dark.svg";
import annBuilderNetworkLight from "@/assets/ann-builder-illustration-light.svg";

const ANN_BUILDER_APP_URL = "https://ann-builder-app.streamlit.app";

/** ANN Builder Studio hero showcase (extracted from the former Labs section). */
const AnnShowcase = () => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] as const }}
      className="flex h-full flex-col overflow-hidden border border-white/[0.08] bg-[hsl(213,42%,6%)]"
    >
      <div className="border-b border-white/[0.06] bg-white/[0.02] p-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <BrainCircuit size={14} /> Live Now
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">ANN Builder Studio</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A guided workspace for exploring data, cleaning datasets, and designing neural
          networks through interactive visuals, preprocessing tools, and prediction outputs.
        </p>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
          Generated Visualization
        </p>
        <div className="relative overflow-hidden border border-white/[0.08] bg-[hsl(213,34%,9%)]">
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

        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-sm border-l-2 border-primary/40 bg-white/[0.02] px-4 py-3">
            <p className="font-semibold text-foreground">Input</p>
            <p className="mt-1 text-muted-foreground">Upload CSV data, review quality, and clean missing values or duplicates before modeling.</p>
          </div>
          <div className="rounded-sm border-l-2 border-primary/40 bg-white/[0.02] px-4 py-3">
            <p className="font-semibold text-foreground">Model</p>
            <p className="mt-1 text-muted-foreground">Set hidden layers, neuron counts, and training parameters in a guided flow.</p>
          </div>
          <div className="rounded-sm border-l-2 border-primary/40 bg-white/[0.02] px-4 py-3">
            <p className="font-semibold text-foreground">Outcome</p>
            <p className="mt-1 text-muted-foreground">Evaluate performance, test new data, and export prediction results.</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="mt-6 flex flex-wrap gap-3 justify-start">
          <Button variant="hero" size="sm" asChild>
            <a href={ANN_BUILDER_APP_URL} target="_blank" rel="noopener noreferrer" data-umami-event="open-ann">
              Open Live App <ExternalLink className="ml-1" size={15} />
            </a>
          </Button>
          <Button variant="heroOutline" size="sm" asChild>
            <a href="https://github.com/Athena-Data-Labs/ANN_builder_app" target="_blank" rel="noopener noreferrer" data-umami-event="open-ann-repo">
              View Repository <Github className="ml-1" size={15} />
            </a>
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default AnnShowcase;
