import { motion } from "framer-motion";
import theraIcon from "@/assets/thera-icon.png";

/**
 * Withheld-screen frame: a flat skeleton standing in for a screen we have but
 * are not publishing. Thera's real screens carry one contractor's live pipeline
 * — their opportunities, their pricing history, their bid decisions — so they
 * stay private. Swapped for real captures when access opens up.
 */
const PreviewFrame = ({ label, caption }: { label: string; caption: string }) => (
  <figure className="flex h-full flex-col bg-[#0a0c10]">
    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/[0.06]">
      {/* Skeleton chrome: toolbar + abstract content blocks standing in for the real UI */}
      <div className="absolute inset-0 p-3">
        <div className="flex items-center gap-1.5 border-b border-white/[0.05] pb-2">
          <span className="h-1.5 w-1.5 bg-white/15" />
          <span className="h-1.5 w-1.5 bg-white/15" />
          <span className="h-1.5 w-1.5 bg-white/15" />
          <span className="ml-2 h-1.5 w-24 bg-white/[0.07]" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-8 border border-white/[0.05] bg-white/[0.02]" />
          <div className="h-8 border border-white/[0.05] bg-white/[0.02]" />
          <div className="h-8 border border-white/[0.05] bg-white/[0.02]" />
        </div>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 w-4/5 bg-white/[0.06]" />
          <div className="h-1.5 w-3/5 bg-white/[0.05]" />
          <div className="h-1.5 w-2/3 bg-white/[0.04]" />
        </div>
        <div className="mt-3 h-12 border border-white/[0.05] bg-white/[0.02]" />
      </div>

      {/* Watermark + status chip */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0c10]/55">
        <img src={theraIcon} alt="" aria-hidden="true" className="h-12 w-12 object-contain opacity-70" loading="lazy" />
        <span className="border border-steel/30 bg-[#0a0c10]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-steel/90">
          Client Data
        </span>
      </div>
    </div>
    <figcaption className="p-5">
      <p className="font-display text-sm font-semibold tracking-tight text-foreground">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{caption}</p>
    </figcaption>
  </figure>
);

/**
 * Thera demo: the three screens the product is built around, and the scoring
 * engine underneath them. Naming, status and CTAs live in the page hero.
 */
const TheraShowcase = () => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        <span className="h-3 w-[2px] shrink-0 bg-steel" />
        Inside Thera · Screens Withheld
      </p>
      <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
        Real screens carry a client&rsquo;s live pipeline
      </p>
    </div>

    <div className="grid gap-px border border-white/[0.07] bg-white/[0.06] md:grid-cols-3">
      <PreviewFrame
        label="Mission Control"
        caption="The pipeline at a glance: scored opportunities, pursuit stages, deadlines, and what needs a decision today."
      />
      <PreviewFrame
        label="Opportunity Briefing"
        caption="A Claude-generated executive brief per notice: scope, risk factors, fit against your twin, and next actions."
      />
      <PreviewFrame
        label="Digital Twin"
        caption="Your company as structured data: capabilities, certifications, past performance, and capacity that drive the scores."
      />
    </div>

    {/* The scoring engine is the product; the screens above are how you see it. */}
    <div className="mt-8 grid gap-px border border-white/[0.07] bg-white/[0.06] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
      <div className="flex items-start gap-4 bg-[hsl(213,38%,9%)] p-6 md:p-7">
        <img
          src={theraIcon}
          alt=""
          aria-hidden="true"
          className="h-11 w-11 shrink-0 object-contain"
          loading="lazy"
        />
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary/85">
            Scoring Engine · Explainable
          </p>
          <p className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
            Bid or no-bid, with the reasoning shown
          </p>
          <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
            Every recommendation traces back to your Digital Twin and the notice itself. Your
            overrides and win/loss outcomes tune the engine for your organization alone.
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-white/[0.06] sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Signals In",
            body: "Live SAM.gov notices and amendments, USAspending award history, and your Digital Twin.",
          },
          {
            step: "02",
            title: "Scores Out",
            body: "Strategic fit, win probability, and risk flags, each with the evidence behind it.",
          },
          {
            step: "03",
            title: "Decision Made",
            body: "A defensible bid/no-bid call, a pursuit plan, and partners ranked for the team.",
          },
        ].map((cell) => (
          <div key={cell.step} className="bg-[#0a0c10] p-6 md:p-7">
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

export default TheraShowcase;
