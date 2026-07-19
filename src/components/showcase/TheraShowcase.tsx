import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import theraIcon from "@/assets/thera-icon.png";

/**
 * Placeholder preview frame: a flat skeleton of the screen this slot will hold,
 * with a Coming Soon chip. Swapped for real screenshots/clips at launch.
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
        <span className="border border-primary/30 bg-[#0a0c10]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
          Coming Soon
        </span>
      </div>
    </div>
    <figcaption className="p-5">
      <p className="font-display text-sm font-semibold tracking-tight text-foreground">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{caption}</p>
    </figcaption>
  </figure>
);

/** Thera hero showcase — full product presentation with coming-soon preview placeholders. */
const TheraShowcase = () => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,9%)]"
    >
      {/* Header band */}
      <div className="border-b border-white/[0.06] bg-white/[0.02] p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <img src={theraIcon} alt="Thera icon" className="h-14 w-14 shrink-0 object-contain" />
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <span className="h-1 w-1 rounded-full bg-primary" /> In Development · Coming Soon
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Thera</h1>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                Capture Intelligence for Government Contracting
              </p>
            </div>
          </div>

          <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3 lg:min-w-[400px]">
            <div className="bg-[#0a0c10] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Users</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">Capture Teams</p>
            </div>
            <div className="bg-[#0a0c10] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Core Loop</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">Notice to Bid Call</p>
            </div>
            <div className="bg-[#0a0c10] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Interface</p>
              <p className="mt-1 font-display text-lg font-semibold text-foreground">Mission Control</p>
            </div>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-[1.7] text-muted-foreground md:text-[15px]">
          AI-native capture intelligence for government contractors. Thera watches the federal
          opportunity stream, maintains a Digital Twin of your company, and scores every notice
          against it — explainable bid/no-bid recommendations, AI briefings, and a pursuit
          pipeline, in one command center.
        </p>
      </div>

      <div className="p-6 md:p-7">
        {/* Preview placeholders — swapped for real product footage at launch */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <span className="h-3 w-[2px] shrink-0 bg-primary" />
            Product Preview
          </p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
            Live walkthrough arrives at launch
          </p>
        </div>

        <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-3">
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

        {/* Scoring engine — the heart of the product */}
        <div className="mt-6 grid gap-px border border-white/[0.07] bg-white/[0.05] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
          <div className="flex items-start gap-3 bg-[#0a0c10] p-5">
            <img
              src={theraIcon}
              alt=""
              aria-hidden="true"
              className="h-9 w-9 shrink-0 object-contain"
              loading="lazy"
            />
            <div>
              <p className="inline-block text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                Scoring Engine · Explainable
              </p>
              <p className="mt-1 font-semibold text-foreground">Bid or no-bid, with the reasoning shown</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Every recommendation traces back to your Digital Twin and the notice itself. Your
                overrides and win/loss outcomes tune the engine for your organization alone.
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-white/[0.05] sm:grid-cols-3">
            <div className="bg-[#0a0c10] p-5">
              <p className="font-semibold text-foreground">Signals In</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Live SAM.gov notices and amendments, USAspending award history, and your Digital Twin.
              </p>
            </div>
            <div className="bg-[#0a0c10] p-5">
              <p className="font-semibold text-foreground">Scores Out</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Strategic fit, win probability, and risk flags — each with the evidence behind it.
              </p>
            </div>
            <div className="bg-[#0a0c10] p-5">
              <p className="font-semibold text-foreground">Decision Made</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A defensible bid/no-bid call, a pursuit plan, and partners ranked for the team.
              </p>
            </div>
          </div>
        </div>

        {/* Launch strip */}
        <div className="mt-6 flex flex-col gap-4 border-l-2 border-primary/40 bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
              Launching Soon
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              In active development. Join the launch list and we&apos;ll notify you when early access opens.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="hero" size="sm" asChild>
              <Link to="/contact" data-umami-event="thera-notify">
                Get Notified at Launch <ArrowRight className="ml-1" size={15} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="sm" asChild>
              <Link to="/resources/case-studies/privacy-first-architecture-security">
                Read the Privacy Architecture
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default TheraShowcase;
