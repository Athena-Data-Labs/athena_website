import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/content";
import { CTA_SECONDARY } from "@/lib/cta";

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


  return (
    <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="bg-surface p-8 md:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/55">
          What it costs
        </p>

        <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-display text-5xl font-black tracking-[-0.03em] text-foreground md:text-6xl">
            {headline}
          </span>
          {qualifiers.length > 0 && (
            <span className="font-mono text-sm tracking-[0.04em] text-steel">
              {qualifiers.join(" · ")}
            </span>
          )}
        </p>

        {product.pricing && (
          <p className="mt-6 max-w-xl text-sm leading-[1.8] text-muted-foreground md:text-base">
            {product.pricing}
          </p>
        )}

        {/* Every product's band closes with the same ask. There were two branches
            here — one for invitation-only products that captured intent on the
            page instead — and Thera was the last of those; its signups are open,
            so the branch went out with it rather than sitting unreachable. */}
        <Link
          to="/contact"
          data-umami-event={`pricing-cta-${product.slug}`}
          className={`mt-8 ${CTA_SECONDARY}`}
        >
          Talk to Us About {product.name}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="bg-surface-sunken p-8 md:p-10">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/55">
          Under the hood
        </p>

        <p className="mt-5 font-display text-base font-semibold tracking-tight text-foreground">
          {product.hosting.detail.title}
        </p>
        <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">
          {product.hosting.detail.body}
        </p>

        <div className="mt-7 border-t border-foreground/[0.07] pt-6">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/55">Built with</p>
          <ul className="mt-4 flex flex-wrap gap-x-1.5 gap-y-2">
            {product.technologies.map((tech) => (
              <li
                key={tech}
                className="border border-foreground/[0.08] bg-foreground/[0.02] px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
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
