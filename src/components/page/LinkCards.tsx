import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export type LinkCardItem = {
  to: string;
  /** Small mono tag, e.g. "Case Study" or "AI // 02" */
  tag: string;
  title: string;
  description: string;
  /** Optional footer meta, e.g. "6 min read · Forecasting" */
  meta?: string;
};

type LinkCardsProps = {
  items: LinkCardItem[];
  /** Grid columns at md+; defaults to 3 */
  columns?: 2 | 3;
  ctaLabel?: string;
  /**
   * Heading level for the card titles. Defaults to 3, which is right when the
   * grid sits inside a SectionBlock — the usual case. The two index pages have
   * no section heading above the grid, so their cards are the first thing under
   * the page h1 and have to be h2s: h1 straight to h3 leaves a screen reader
   * announcing a level that never opened.
   */
  headingLevel?: 2 | 3;
};

/** Hairline-grid of flat link cards — the site's standard cross-linking unit. */
const LinkCards = ({ items, columns = 3, ctaLabel = "Read More", headingLevel = 3 }: LinkCardsProps) => {
  const Heading = `h${headingLevel}` as const;
  if (items.length === 0) return null;
  // Pad incomplete last rows so the hairline backdrop doesn't show through as an empty cell.
  const fillerCount = (columns - (items.length % columns)) % columns;
  return (
    <div
      className={`grid gap-px border border-foreground/[0.07] bg-foreground/[0.05] ${
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.to + item.title}
          to={item.to}
          className="group flex h-full flex-col bg-background p-7 transition-colors hover:bg-foreground/[0.02] focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary/60"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/45">{item.tag}</p>
          <Heading className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
            {item.title}
          </Heading>
          <p className="mt-3 flex-1 text-sm leading-[1.65] text-muted-foreground">{item.description}</p>
          {item.meta && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60">{item.meta}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50 transition-colors group-hover:text-steel">
            {ctaLabel} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
      {Array.from({ length: fillerCount }).map((_, i) => (
        <div key={`filler-${i}`} className="hidden bg-background md:block" aria-hidden="true" />
      ))}
    </div>
  );
};

export default LinkCards;
