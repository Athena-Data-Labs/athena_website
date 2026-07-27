import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/content";

/**
 * Price and stack, side by side.
 *
 * The price used to be a one-line footnote under the feature grid, which is a
 * strange place to hide the single fact that decides whether someone keeps
 * reading. It gets its own band now, at the size it deserves, with the stack
 * next to it — the two questions a technical buyer asks in the same breath.
 */
const ProductPricing = ({ product }: { product: Product }) => {
  // Every priceLabel is written "headline · qualifier", so one split covers
  // "$50/mo · $500/yr", "+$100 per company", and "Free · Open source" alike.
  const [headline, ...qualifiers] = (product.priceLabel ?? "On request").split(" · ");

  const cta = product.comingSoon
    ? { to: "#early-access", label: "Join the Launch List", umami: `launch-list-${product.slug}` }
    : product.priceUsdMonthly
      ? { to: "/contact", label: `Talk to Us About ${product.name}`, umami: `pricing-cta-${product.slug}` }
      : null;

  return (
    <div className="grid gap-px border border-white/[0.07] bg-white/[0.06] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="bg-[hsl(213,38%,9%)] p-8 md:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
          What it costs
        </p>

        <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-display text-5xl font-black tracking-[-0.03em] text-white md:text-6xl">
            {headline}
          </span>
          {qualifiers.length > 0 && (
            <span className="font-mono text-sm tracking-[0.04em] text-steel/90">
              {qualifiers.join(" · ")}
            </span>
          )}
        </p>

        {product.pricing && (
          <p className="mt-6 max-w-xl text-sm leading-[1.8] text-muted-foreground md:text-base">
            {product.pricing}
          </p>
        )}

        {cta &&
          (cta.to.startsWith("#") ? (
            <a
              href={cta.to}
              data-umami-event={cta.umami}
              className="group mt-8 inline-flex items-center gap-2 bg-primary px-7 py-[15px] text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta.label}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          ) : (
            <Link
              to={cta.to}
              data-umami-event={cta.umami}
              className="group mt-8 inline-flex items-center gap-2 border border-white/15 px-7 py-[15px] text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-steel/50 hover:text-steel"
            >
              {cta.label}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
      </div>

      <div className="bg-[hsl(213,42%,6%)] p-8 md:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
          Under the hood
        </p>

        <p className="mt-5 font-display text-base font-semibold tracking-tight text-foreground">
          {product.hosting.detail.title}
        </p>
        <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">
          {product.hosting.detail.body}
        </p>

        <div className="mt-7 border-t border-white/[0.07] pt-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Built with</p>
          <ul className="mt-4 flex flex-wrap gap-x-1.5 gap-y-2">
            {product.technologies.map((tech) => (
              <li
                key={tech}
                className="border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductPricing;
