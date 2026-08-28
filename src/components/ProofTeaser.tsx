import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { products } from "@/content";
import { contentIcons, productImages } from "@/components/content-icons";
import ProductMark from "@/components/ProductMark";
import HomeProductPreview from "@/components/HomeProductPreview";
import { DUR, EASE } from "@/lib/motion";

/**
 * The three shipped products, plus a cell that shows them running.
 *
 * ANN Builder Studio is left out here and only here. It is a browser
 * demonstration rather than something a client buys, so of the four it was the
 * one card not doing this section's job; it keeps its place on /products, in
 * the footer, and in the build log.
 */
const shown = products.filter((p) => p.slug !== "ann-studio");

const ProofTeaser = () => {
  return (
    <section id="products" className="relative border-b border-foreground/[0.06] py-12 md:py-20 panel">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DUR.reveal, ease: EASE }}
          className="mb-10 md:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
              <span className="h-3 w-[2px] shrink-0 bg-steel" />
              Proof of Delivery
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Live in Production
            </h2>
            <div className="mt-3 h-px w-16 bg-steel/40" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Not a portfolio of concepts. Every one of these was designed, built, shipped, and is
              run by us, which makes them the honest answer to the question clients actually ask:
              could you build us something like this? Yes. This is what it looks like when we do.
            </p>
          </div>
          <Link
            to="/products"
            data-umami-event="explore-products"
            className="inline-flex shrink-0 items-center gap-2 border border-steel/45 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-steel transition-colors hover:bg-steel/10"
          >
            Explore Products <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.05] md:grid-cols-2 lg:grid-cols-4">
          {shown.map((p, i) => {
            const img = productImages[p.icon];
            const Icon = contentIcons[p.icon];
            const inner = (
              <>
                <div className="flex items-center gap-3">
                  {img ? (
                    <ProductMark
                      icon={p.icon}
                      alt={`${p.name} icon`}
                      className="h-11 w-11 shrink-0 object-contain"
                    />
                  ) : (
                    Icon && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-steel/25 text-steel">
                        <Icon size={22} />
                      </div>
                    )
                  )}
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                      {p.name}
                    </h3>
                    {/* Dot pinned to the first line, not the middle of the
                        block — these tags wrap to two lines on a phone. */}
                    <p className="mt-0.5 flex items-start gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/45">
                      <span className="flex h-[1.55em] shrink-0 items-center">
                        <span className="h-1 w-1 rounded-full bg-steel" />
                      </span>
                      {p.tag}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-[1.65] text-muted-foreground">
                  {p.summary}
                </p>
                {p.priceLabel && (
                  <p className="mt-4 font-mono text-[11px] tracking-[0.06em] text-steel/90">
                    {p.priceLabel}
                  </p>
                )}
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50 transition-colors group-hover:text-steel">
                  View Product
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </>
            );
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: DUR.reveal, delay: i * 0.08, ease: EASE }}
                className="h-full"
              >
                <Link
                  to={`/products/${p.slug}`}
                  className="group flex h-full flex-col bg-background p-7 transition-colors hover:bg-foreground/[0.02]"
                >
                  {inner}
                </Link>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: DUR.reveal, delay: shown.length * 0.08, ease: EASE }}
            className="h-full"
          >
            <HomeProductPreview />
          </motion.div>
        </div>

        {/* The products are the argument, not the whole offer. Say the second
            part out loud so the section does not read as a SaaS catalogue. */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-xs leading-relaxed text-muted-foreground/70">
            Each one started as a problem someone actually had. If yours looks like one of
            these, we have already solved most of it once.
          </p>
          <Link
            to="/contact"
            data-umami-event="build-me-one"
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel/80 transition-colors hover:text-steel"
          >
            Build Me Something Like This <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProofTeaser;
