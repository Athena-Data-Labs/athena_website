import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, ExternalLink, Github, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSectionById } from "@/lib/scroll";
import { DASHBOARD_OPEN_URL } from "@/lib/dashboard";
import annBuilderNetworkDark from "@/assets/ann-builder-illustration-dark.svg";
import annBuilderNetworkLight from "@/assets/ann-builder-illustration-light.svg";

const ANN_BUILDER_APP_URL = "https://ann-builder-app.streamlit.app";

const LabsSection = () => {

  return (
    <section id="labs" className="relative border-b border-white/[0.06] py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="mb-10 text-center"
        >
          <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Interactive Labs
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Live Demos & Product Concepts
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground leading-relaxed md:text-lg md:leading-[1.65]">
            Athena Labs showcases production-grade intelligence products. Each demo shows
            how we transform raw data into trusted signals, predictive guidance, and outcomes.
          </p>
        </motion.div>

        <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <motion.article
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] as const }}
            className="overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,9%)]"
          >
            <div className="border-b border-white/[0.06] bg-white/[0.02] p-6">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <LayoutDashboard size={14} /> Live Now
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">Athena Intelligence Dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A premium business intelligence command center built for leadership teams.
                Unify live KPIs, predictive modeling, anomaly alerts, and AI agent-assisted analysis in one view.
              </p>
            </div>

            <div className="p-6">
              <div className="overflow-hidden border border-white/[0.08] bg-[hsl(213,34%,9%)]">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-primary/80">Command Center</p>
                    <p className="mt-1 text-xs text-muted-foreground">Last 12 months</p>
                  </div>
                  <a
                    href={DASHBOARD_OPEN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-primary/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/10"
                  >
                    Open Full App <ExternalLink size={13} />
                  </a>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 border-b border-white/[0.06] p-4 sm:grid-cols-3 md:grid-cols-6">
                  <div className="rounded-sm border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-primary/70">Revenue</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">$23,530</p>
                    <p className="text-[10px] text-emerald-500">↑ 5.2%</p>
                  </div>
                  <div className="rounded-sm border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-primary/70">Expenses</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">$12,285</p>
                    <p className="text-[10px] text-orange-500">↑ 4.2%</p>
                  </div>
                  <div className="rounded-sm border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-primary/70">Net</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">$11,245</p>
                    <p className="text-[10px] text-emerald-500">↑ 6.3%</p>
                  </div>
                  <div className="rounded-sm border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-primary/70">Coverage</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">1.92x</p>
                    <p className="text-[10px] text-primary/60">vs 1.90x</p>
                  </div>
                  <div className="rounded-sm border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-primary/70">Net Margin</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">47.8%</p>
                    <p className="text-[10px] text-primary/60">of revenue</p>
                  </div>
                  <div className="rounded-sm border border-white/[0.08] bg-white/[0.02] p-2.5">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-primary/70">Runway</p>
                    <p className="mt-1 font-display text-sm font-bold text-foreground">43 mo</p>
                    <p className="text-[10px] text-primary/60">to zero</p>
                  </div>
                </div>

                {/* Signal Alerts Section */}
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-primary/80">Signals</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 border-l-2 border-orange-500 bg-orange-500/10 p-2">
                      <span className="mt-0.5 inline-block h-2 w-2 bg-orange-500" />
                      <div className="text-[11px]">
                        <p className="font-semibold text-orange-400">Expense anomalies</p>
                        <p className="mt-0.5 text-muted-foreground">2 unusual transactions flagged</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 border-l-2 border-amber-500 bg-amber-500/10 p-2">
                      <span className="mt-0.5 inline-block h-2 w-2 bg-amber-500" />
                      <div className="text-[11px]">
                        <p className="font-semibold text-amber-400">Client concentration</p>
                        <p className="mt-0.5 text-muted-foreground">Top client at 41% of revenue</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Copilot Section */}
                <div className="border-l-2 border-primary/40 bg-white/[0.02] p-4">
                  <p className="inline-block text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                    Athena Guardian
                  </p>
                  <p className="mt-2 font-semibold text-foreground">CFO Intelligence Copilot</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Move from raw metrics to decisions with context-aware guidance. Live dashboard context, risk-first analysis, and actionable recommendations.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
                Live-embedded preview coming soon. Open the full dashboard now to explore real-time KPI tracking, predictive modeling, anomaly detection, and AI-assisted insights.
              </p>

              <div className="mt-4 border-l-2 border-primary/40 bg-white/[0.02] px-6 py-5">
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

          <motion.article
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.06, ease: [0.34, 1.56, 0.64, 1] as const }}
            className="flex h-full flex-col overflow-hidden border border-l-0 border-white/[0.08] bg-[hsl(213,42%,6%)] lg:rounded-l-none"
          >
            <div className="border-b border-white/[0.06] bg-white/[0.02] p-6">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <BrainCircuit size={14} /> Live Now
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight">ANN Builder Studio</h3>
              <p className="mt-2 text-sm text-muted-foreground">
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

              <div className="mt-5 grid gap-3 text-sm">
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
              <div className="mt-6 flex flex-wrap gap-3 justify-start lg:justify-start">
                <Button variant="hero" size="sm" asChild>
                  <a href={ANN_BUILDER_APP_URL} target="_blank" rel="noopener noreferrer">
                    Open Live App <ExternalLink className="ml-1" size={15} />
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
        </div>
      </div>
    </section>
  );
};

export default LabsSection;
