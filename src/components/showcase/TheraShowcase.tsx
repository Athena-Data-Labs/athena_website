import { motion } from "framer-motion";
import ProductMark from "@/components/ProductMark";
import TheraVideo from "@/components/showcase/TheraVideo";

/** A captured screen, in both themes, with CSS choosing — same `dark` class
 *  next-themes writes to <html>. A still rather than a clip wherever the point
 *  is something a reader has to *read*: video scrolls past a score breakdown
 *  before anyone has finished it. */
const Shot = ({ name, alt, className = "" }: { name: string; alt: string; className?: string }) => (
  <>
    {(["light", "dark"] as const).map((theme) => (
      <img
        key={theme}
        src={`/thera-shot-${name}-${theme}.webp`}
        alt={theme === "light" ? alt : ""}
        width={1800}
        height={1125}
        loading="lazy"
        decoding="async"
        className={`w-full ${theme === "dark" ? "hidden dark:block" : "dark:hidden"} ${className}`}
      />
    ))}
  </>
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
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
        <span className="h-3 w-[2px] shrink-0 bg-steel" />
        Inside Thera · Real Screens
      </p>
      <a
        href="https://thera.athenadatalabs.com/signup"
        target="_blank"
        rel="noopener noreferrer"
        data-umami-event="thera-showcase-trial"
        className="text-[10px] uppercase tracking-[0.14em] text-foreground/40 transition-colors hover:text-steel"
      >
        Recorded against a demo contractor &mdash; run it on your own free &rarr;
      </a>
    </div>

    <TheraVideo />

    {/* The scoring engine is the product; the screens above are how you see it. */}
    <div className="mt-8 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.85fr)]">
      <div className="flex items-start gap-4 bg-surface p-6 md:p-7">
        <ProductMark
          icon="thera"
          alt=""
          decorative
          className="h-11 w-11 shrink-0 object-contain"
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

      <div className="grid gap-px bg-foreground/[0.06] sm:grid-cols-3">
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

    {/* The claim above is that every score is explainable. This is the
        screen where that is either true or it isn't, and it is a still
        because the numbers have to be readable — a clip scrolls past a
        seven-factor breakdown before anyone has finished the second row. */}
    <figure className="mt-8 overflow-hidden border border-foreground/[0.07] bg-surface">
      <Shot
        name="scored-notice"
        alt="A scored SAM.gov notice in Thera: a strategic score of 86 with win probability, risk and confidence, above the seven weighted factors that produced it — NAICS match 22 of 22 points, capability fit 16 of 20, set-aside advantage 15.3 of 18 — each with a sentence of evidence underneath."
        className="border-b border-foreground/[0.06]"
      />
      <figcaption className="px-6 py-4 text-sm leading-[1.65] text-muted-foreground">
        <span className="font-semibold text-foreground">Every score adds up in public.</span>{" "}
        Seven factors, each with its weight, its points, and the sentence of evidence behind it.
        A contracting officer&rsquo;s question is &ldquo;why this one&rdquo;, and the answer is on
        the screen rather than in a model nobody can open.
      </figcaption>
    </figure>

    {/* The network is the product's second direction, and it needs its own
        block rather than a line in the feature grid: "marketplace" is a word
        every contractor directory has already spent on them. So describe the
        mechanism instead — matched, then returned inside somebody else's
        search for a specific notice — because that is the part none of those
        directories do. Two cells, not another numbered strip; the whole point
        is that it is one profile pointing both ways. */}
    <div className="mt-8 border border-foreground/[0.07] bg-surface p-6 md:p-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary/85">
        The Thera Network · Opt-In
      </p>
      <p className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
        One profile, pointing both ways
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-[1.65] text-muted-foreground">
        Capability is rarely what keeps a small firm out of federal work. Being unknown is, and
        there is no list to get onto.
      </p>

      <div className="mt-6 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-2">
        {[
          {
            direction: "You need a partner",
            body: "Thera ranks subcontractor candidates for the notice in front of you, drawn from public federal award data — with network members above them.",
          },
          {
            direction: "Someone needs you",
            body: "Your listing is matched on NAICS and service area and returned inside their search for a live contract, carrying the contact details you chose to publish.",
          },
        ].map((side) => (
          <div key={side.direction} className="bg-background p-6">
            <p className="font-display text-base font-semibold tracking-tight text-foreground">
              {side.direction}
            </p>
            <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{side.body}</p>
          </div>
        ))}
      </div>

      <figure className="mt-6 overflow-hidden border border-foreground/[0.07] bg-background">
        <Shot
          name="partners"
          alt="Thera's execution partners page: seven subcontractors with their NAICS codes, states, certifications and relationship strength, each row showing the live notices they were suggested for and a fit score — and below them the member's own network listing, published."
        />
      </figure>

      <p className="mt-5 border-l-2 border-steel/40 pl-5 text-xs leading-[1.7] text-muted-foreground">
        Off until you switch it on. Unpublish and you are out of every search immediately, and
        nothing about your pipeline, scores, or drafts is visible to another member at any point.
      </p>
    </div>
  </motion.div>
);

export default TheraShowcase;
