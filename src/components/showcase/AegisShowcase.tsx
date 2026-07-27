import { motion } from "framer-motion";
import AegisVideo from "@/components/showcase/AegisVideo";
import glaukosIcon from "@/assets/glaukos-icon.webp";

/**
 * Aegis BI demo: the live command-center walkthrough plus Glaukos, the AI
 * analyst inside it.
 *
 * This used to open with its own icon, name, tagline, summary and CTA row —
 * all of which the page hero now carries. What is left is the part only this
 * component can do: show the thing running.
 */
const AegisShowcase = () => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        <span className="h-3 w-[2px] shrink-0 bg-steel" />
        Product Walkthrough · Real Footage
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Click any clip to expand</p>
    </div>

    <AegisVideo />

    {/* Glaukos: a product inside the product, so it gets its own frame. */}
    <div className="mt-8 grid gap-px border border-white/[0.07] bg-white/[0.06] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
      <div className="flex items-start gap-4 bg-[hsl(213,38%,9%)] p-6 md:p-7">
        <img
          src={glaukosIcon}
          alt="Glaukos AI analyst icon"
          className="h-11 w-11 shrink-0 object-contain"
          loading="lazy"
        />
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary/85">
            Glaukos · AI Analyst
          </p>
          <p className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
            Ask your data in plain English
          </p>
          <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
            Glaukos reads your live dashboard context, runs risk-first analysis, and returns
            actionable recommendations and briefings. No SQL, no formulas.
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Input",
            body: "Operational metrics, financial trends, and customer signals unified into one workspace.",
          },
          {
            step: "02",
            title: "Insight",
            body: "Forecasts, anomaly detection, and agent-generated narratives that explain what changed.",
          },
          {
            step: "03",
            title: "Outcome",
            body: "Faster, higher-confidence decisions with transparent context and prioritized next actions.",
          },
        ].map((cell) => (
          <div key={cell.step} className="bg-[#0a0c10] p-6">
            <span className="font-mono text-[10px] tracking-[0.16em] text-white/20">{cell.step}</span>
            <p className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
              {cell.title}
            </p>
            <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{cell.body}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default AegisShowcase;
