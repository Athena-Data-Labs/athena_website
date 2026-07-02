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
};

/** Hairline-grid of flat link cards — the site's standard cross-linking unit. */
const LinkCards = ({ items, columns = 3, ctaLabel = "Read More" }: LinkCardsProps) => {
  if (items.length === 0) return null;
  // Pad incomplete last rows so the hairline backdrop doesn't show through as an empty cell.
  const fillerCount = (columns - (items.length % columns)) % columns;
  return (
    <div
      className={`grid gap-px border border-white/[0.07] bg-white/[0.05] ${
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.to + item.title}
          to={item.to}
          className="group flex h-full flex-col bg-[#0a0c10] p-7 transition-colors hover:bg-white/[0.02] focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary/60"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/70">{item.tag}</p>
          <h3 className="mt-3 font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
            {item.title}
          </h3>
          <p className="mt-3 flex-1 text-sm leading-[1.65] text-muted-foreground">{item.description}</p>
          {item.meta && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60">{item.meta}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary/70 transition-colors group-hover:text-primary">
            {ctaLabel} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
      {Array.from({ length: fillerCount }).map((_, i) => (
        <div key={`filler-${i}`} className="hidden bg-[#0a0c10] md:block" aria-hidden="true" />
      ))}
    </div>
  );
};

export default LinkCards;
