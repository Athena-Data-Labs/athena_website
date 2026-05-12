import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, ExternalLink, Github, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSectionById } from "@/lib/scroll";
import { DASHBOARD_OPEN_URL } from "@/lib/dashboard";
import annBuilderNetworkDark from "@/assets/ann-builder-illustration-dark.svg";
import annBuilderNetworkLight from "@/assets/ann-builder-illustration-light.svg";

const LabsSection = () => {

  return (
    <section id="labs" className="relative py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-10 text-center"
        >
          <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Interactive Labs
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Live Demos & Product Concepts
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground md:text-lg">
            Athena Labs showcases production-grade intelligence products. Each demo shows
            how we transform raw data into trusted signals, predictive guidance, and executive-level action.
          </p>
        </motion.div>

        <div className="grid gap-7 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden rounded-2xl border border-border/50 card-gradient"
          >
            <div className="border-b border-border/40 bg-secondary/20 p-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <BrainCircuit size={14} /> Live Now
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">ANN Builder Studio</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A guided workspace for designing neural networks and understanding model
                behavior through interactive visuals and prediction outputs.
              </p>
            </div>

            <div className="flex h-full flex-col p-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                Generated Visualization
              </p>
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={annBuilderNetworkLight}
                  alt="Stylized neural network illustration for ANN Builder Studio"
                  className="w-full rounded-lg object-cover dark:hidden"
                  loading="lazy"
                />
                <img
                  src={annBuilderNetworkDark}
                  alt="Stylized neural network illustration for ANN Builder Studio"
                  className="hidden w-full rounded-lg object-cover dark:block"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
                Visual style preview inspired by the app's real network rendering workflow.
              </p>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg border-l-2 border-primary/40 bg-secondary/10 px-4 py-3">
                  <p className="font-semibold text-foreground">Input</p>
                  <p className="mt-1 text-muted-foreground">Upload CSV data and explore distributions, relationships, and signal quality.</p>
                </div>
                <div className="rounded-lg border-l-2 border-primary/40 bg-secondary/10 px-4 py-3">
                  <p className="font-semibold text-foreground">Model</p>
                  <p className="mt-1 text-muted-foreground">Set hidden layers, neuron counts, and training parameters in a guided flow.</p>
                </div>
                <div className="rounded-lg border-l-2 border-primary/40 bg-secondary/10 px-4 py-3">
                  <p className="font-semibold text-foreground">Outcome</p>
                  <p className="mt-1 text-muted-foreground">Evaluate performance, test new data, and export prediction results.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="hero" size="sm" asChild>
                  <a href="https://vahidinj.streamlit.app" target="_blank" rel="noopener noreferrer">
                    Launch Studio <ExternalLink className="ml-1" size={15} />
                  </a>
                </Button>
                <Button variant="heroOutline" size="sm" asChild>
                  <a href="https://github.com/Athena-Data-Labs/ANN_builder_app" target="_blank" rel="noopener noreferrer">
                    View Repository <Github className="ml-1" size={15} />
                  </a>
                </Button>
              </div>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden rounded-2xl border border-border/50 card-gradient"
          >
            <div className="border-b border-border/40 bg-secondary/20 p-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <LayoutDashboard size={14} /> Live Now
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">Athena Intelligence Dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A premium business intelligence command center built for leadership teams.
                Unify live KPIs, predictive modeling, anomaly alerts, and AI agent-assisted analysis in one view.
              </p>
            </div>

            <div className="p-6">
              <div className="overflow-hidden rounded-xl border border-border/50 bg-background/40">
                <div className="flex items-center justify-between border-b border-border/40 bg-secondary/30 px-4 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/90">
                    Dashboard Snapshot
                  </p>
                  <a
                    href={DASHBOARD_OPEN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    Open Full App <ExternalLink size={13} />
                  </a>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-primary/90">Revenue</p>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">$23,530</p>
                    <p className="text-xs text-emerald-400">+5.2% vs prior window</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-primary/90">Runway</p>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">43 months</p>
                    <p className="text-xs text-foreground/70">Projected cash coverage</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-primary/90">AI Copilot Brief</p>
                    <p className="mt-1 text-sm text-foreground/90">
                      Expense anomalies and client concentration are the top near-term risks. Priority actions are vendor review,
                      spend controls, and top-client diversification planning.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
                Secure live preview will be enabled after dashboard HTTPS hardening. Open the full app now for the complete interactive experience.
              </p>

              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6">
                <p className="font-display text-lg font-semibold text-foreground">Decision Intelligence Flow</p>
                <div className="mt-3 grid gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">Input</p>
                    <p className="text-muted-foreground">Operational metrics, financial trends, and customer signals unified into one executive workspace.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Insight</p>
                    <p className="text-muted-foreground">Forward-looking forecasts, anomaly detection, and agent-driven narratives that explain what changed and why it matters.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Outcome</p>
                    <p className="text-muted-foreground">Faster, higher-confidence decisions powered by transparent model context and prioritized next actions.</p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
                Designed to become a company&apos;s primary BI system, from board-level reporting to day-to-day operational execution.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="hero" size="sm" asChild>
                  <a href={DASHBOARD_OPEN_URL} target="_blank" rel="noopener noreferrer">
                    Open Live Dashboard <ExternalLink className="ml-1" size={15} />
                  </a>
                </Button>
                <Button variant="heroOutline" size="sm" asChild>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSectionById("contact");
                    }}
                  >
                    Book an Executive Demo <ArrowRight className="ml-1" size={15} />
                  </a>
                </Button>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
};

export default LabsSection;
