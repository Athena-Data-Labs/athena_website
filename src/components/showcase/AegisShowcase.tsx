import { motion } from "framer-motion";
import AegisVideo from "@/components/showcase/AegisVideo";
import ProductMark from "@/components/ProductMark";
import { DUR, EASE } from "@/lib/motion";

/** A captured screen. Aegis ships one theme, so there is one file — the frame
 *  around it is what stops a light dashboard reading as a hole in a dark page.
 *  A still rather than a clip wherever the point is something to be *read*:
 *  video moves past a KPI row before the third number has landed. */
const Shot = ({ name, alt }: { name: string; alt: string }) => (
  <img
    src={`/aegis-shot-${name}.webp`}
    alt={alt}
    width={1800}
    height={1438}
    loading="lazy"
    decoding="async"
    className="w-full"
  />
);

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
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: DUR.reveal, ease: EASE }}
  >
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-meta">
        <span className="h-3 w-[2px] shrink-0 accent-bar" />
        Product Walkthrough · Real Footage
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-meta-quiet">Click any clip to expand</p>
    </div>

    <AegisVideo />

    {/* One still of the destination. The clips show it being built and being
        driven; this is what it looks like when you open it on a Monday, and it
        is the only place the numbers hold still long enough to read. */}
    <figure className="mt-8 overflow-hidden border border-foreground/[0.07] bg-surface">
      <Shot
        name="command-center"
        alt="The Aegis BI Command Center for a demo company: total revenue $297,310 up 17%, net profit $101,788, 34.2% net margin, 19 months of runway and 5 active clients, above an intelligence panel flagging one loss month, 49% client concentration and a single expense anomaly, each with a suggested next action, and a monthly revenue-and-expense chart with a forecast outlook beside it."
      />
      <figcaption className="border-t border-foreground/[0.06] px-6 py-4 text-sm leading-[1.65] text-muted-foreground">
        <span className="font-semibold text-foreground">Every figure here came out of one spreadsheet</span>{" "}
        with cryptic headers and three sheets, in about a minute, with no template and no fixed
        columns. The panel underneath does not just report. It says which number is a risk and
        what to open next.
      </figcaption>
    </figure>

    {/* Glaukos: a product inside the product, so it gets its own frame. */}
    <div className="mt-8 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
      <div className="flex items-start gap-4 bg-surface p-6 md:p-7">
        <ProductMark
          icon="glaukos"
          alt="Glaukos AI analyst icon"
          className="h-11 w-11 shrink-0 object-contain"
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

      <div className="grid gap-px bg-foreground/[0.06] sm:grid-cols-3">
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
          <div key={cell.step} className="bg-background p-6 md:p-7">
            <span className="font-mono text-[10px] tracking-[0.16em] text-foreground/20">{cell.step}</span>
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
