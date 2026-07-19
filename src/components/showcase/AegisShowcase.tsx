import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DASHBOARD_OPEN_URL } from "@/lib/dashboard";
import AegisVideo from "@/components/showcase/AegisVideo";
import aegisIcon from "@/assets/aegis-bi-icon.webp";
import glaukosIcon from "@/assets/glaukos-icon.webp";

/** Aegis BI hero showcase — the live command-center walkthrough (extracted from the former Labs section). */
const AegisShowcase = () => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] as const }}
      className="overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,9%)]"
    >
      <div className="border-b border-white/[0.06] bg-white/[0.02] p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={aegisIcon}
              alt="Aegis BI icon"
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <span className="h-1 w-1 rounded-full bg-primary" /> Flagship · In Production
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Aegis BI</h1>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                AI Financial Intelligence
              </p>
            </div>
          </div>

          <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3 lg:min-w-[360px]">
            <div className="bg-[#0a0c10] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Users</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">Operators</p>
            </div>
            <div className="bg-[#0a0c10] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Core Loop</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">Upload to Insight</p>
            </div>
            <div className="bg-[#0a0c10] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Interface</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">Command Center</p>
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-[1.7] text-muted-foreground md:text-[15px]">
          AI-assisted financial intelligence for small businesses. Upload a spreadsheet and Aegis
          maps the columns, builds a command-center dashboard, forecasts cash and revenue, runs
          what-if scenarios, and answers questions in plain English.
        </p>
      </div>

      <div className="p-6 md:p-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <span className="h-3 w-[2px] shrink-0 bg-primary" />
            Product Walkthrough · Real Footage
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
            Click any clip to expand
          </p>
        </div>

        <AegisVideo />

        {/* Glaukos — the AI analyst inside Aegis BI */}
        <div className="mt-6 grid gap-px border border-white/[0.07] bg-white/[0.05] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
          <div className="flex items-start gap-3 bg-[#0a0c10] p-5">
            <img
              src={glaukosIcon}
              alt="Glaukos AI analyst icon"
              className="h-9 w-9 shrink-0 object-contain"
              loading="lazy"
            />
            <div>
              <p className="inline-block text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                Glaukos · AI Analyst
              </p>
              <p className="mt-1 font-semibold text-foreground">Ask your data in plain English</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Glaukos reads your live dashboard context, runs risk-first analysis, and returns
                actionable recommendations and briefings. No SQL, no formulas.
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-white/[0.05] sm:grid-cols-3">
            <div className="bg-[#0a0c10] p-5">
              <p className="font-semibold text-foreground">Input</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Operational metrics, financial trends, and customer signals unified into one workspace.
              </p>
            </div>
            <div className="bg-[#0a0c10] p-5">
              <p className="font-semibold text-foreground">Insight</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Forecasts, anomaly detection, and agent-generated narratives that explain what changed.
              </p>
            </div>
            <div className="bg-[#0a0c10] p-5">
              <p className="font-semibold text-foreground">Outcome</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Faster, higher-confidence decisions with transparent context and prioritized next actions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-l-2 border-primary/40 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
              Primary Use Case
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Built to run as a company&apos;s primary BI system, from board reporting to daily operations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="hero" size="sm" asChild>
              <a href={DASHBOARD_OPEN_URL} target="_blank" rel="noopener noreferrer" data-umami-event="open-aegis-products">
                Open Live Dashboard <ExternalLink className="ml-1" size={15} />
              </a>
            </Button>
            <Button variant="heroOutline" size="sm" asChild>
              <Link to="/contact" data-umami-event="request-demo">
                Request a Demo <ArrowRight className="ml-1" size={15} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default AegisShowcase;
