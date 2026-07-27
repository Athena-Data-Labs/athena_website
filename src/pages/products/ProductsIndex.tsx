import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ConsultationCta from "@/components/ConsultationCta";
import BuildLog from "@/components/BuildLog";
import SectionBlock from "@/components/page/SectionBlock";
import { products, type Product } from "@/content";
import { contentIcons, productImages } from "@/components/content-icons";

/**
 * The flagship carries the page; the rest sit in a spec grid beneath it.
 *
 * This was a flat list of four equal rows, which made the page read as an
 * inventory rather than a portfolio. Hierarchy does the selling: one product
 * gets the argument, the others get a scannable spec card.
 */
const [flagship, ...rest] = products;

const ProductIcon = ({ product, size }: { product: Product; size: "lg" | "md" }) => {
  const img = productImages[product.icon];
  const Icon = contentIcons[product.icon];
  const box = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  if (img) {
    return (
      <img
        src={img}
        alt=""
        aria-hidden="true"
        className={`${box} shrink-0 object-contain`}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return Icon ? (
    <span className={`${box} flex shrink-0 items-center justify-center border border-steel/25 text-steel`}>
      <Icon size={size === "lg" ? 30 : 22} />
    </span>
  ) : null;
};

/** Mono spec row, the idiom the field notes and services pages already use. */
const Spec = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">{label}</span>
    <span className="text-right text-sm text-foreground/90">{value}</span>
  </div>
);

const ProductsIndex = () => (
  <PageShell
    greek={{ word: "ἔργα", roman: "erga", gloss: "works" }}
    eyebrow="Products"
    title={
      <>
        Live Products &amp; <span className="text-gradient">Proof of Delivery</span>
      </>
    }
    intro="Four products we designed, built, shipped, and run. Every one is open to inspection, priced in the open, and doubles as the answer when someone asks whether we could build them something similar."
  >
    <Seo
      title="Products: Aegis BI, MyBudgetNerd, Thera & ANN Builder"
      description="The products Athena Data Labs has shipped: Aegis BI financial intelligence from $50/mo, MyBudgetNerd on the App Store, the ANN Builder neural-network studio, and Thera capture intelligence for GovCon."
      path="/products"
      image="/og/products.png"
      bare
    />

    {/* ── Flagship ─────────────────────────────────────────────────────── */}
    <section className="border-b border-white/[0.06] panel py-12 md:py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid gap-px border border-white/[0.07] bg-white/[0.06] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
        >
          <div className="bg-[hsl(213,38%,9%)] p-8 md:p-10">
            <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/90">
              <span className="h-2.5 w-[2px] shrink-0 bg-primary" />
              Flagship
            </p>

            <div className="mt-6 flex items-start gap-5">
              <ProductIcon product={flagship} size="lg" />
              <div className="min-w-0">
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {flagship.name}
                </h2>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
                  {flagship.tagline}
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-xl text-base leading-[1.8] text-muted-foreground">
              {flagship.overview[0]}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href="https://aegis.athenadatalabs.com"
                target="_blank"
                rel="noopener noreferrer"
                data-umami-event="open-aegis-products"
                className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Open It Live <ArrowUpRight size={14} />
              </a>
              <Link
                to={`/products/${flagship.slug}`}
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-steel/85 transition-colors hover:text-steel"
              >
                Full Walkthrough
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col bg-[hsl(213,42%,6%)] p-8 md:p-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Spec</p>
            <div className="mt-4">
              <Spec label="Status" value="In production" />
              <Spec label="Price" value={flagship.priceLabel ?? "On request"} />
              <Spec label="Platform" value="Web · PWA · iOS pending" />
              <Spec label="Runs on" value="Docker on EC2" />
              <Spec label="Data" value="On-device, stateless backend" />
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
              Open to explore with demo data before you talk to anyone.
            </p>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── The rest ─────────────────────────────────────────────────────── */}
    <SectionBlock eyebrow="Also Shipped" title="The Rest of the Line">
      <div className="grid gap-px border border-white/[0.07] bg-white/[0.06] md:grid-cols-3">
        {rest.map((product, i) => (
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-full"
          >
            <Link
              to={`/products/${product.slug}`}
              className="group flex h-full flex-col bg-[#0a0c10] p-7 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-start justify-between gap-4">
                <ProductIcon product={product} size="md" />
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.16em] ${
                    product.comingSoon ? "text-primary/80" : "text-white/35"
                  }`}
                >
                  {product.comingSoon ? "In development" : "Live"}
                </span>
              </div>

              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-foreground">
                {product.name}
              </h3>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                {product.tagline}
              </p>
              <p className="mt-4 flex-1 text-sm leading-[1.65] text-muted-foreground">
                {product.summary}
              </p>

              <div className="mt-6 border-t border-white/[0.07] pt-4">
                {product.priceLabel && (
                  <p className="font-mono text-[11px] tracking-[0.06em] text-steel/90">
                    {product.priceLabel}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors group-hover:text-steel">
                  {product.comingSoon ? "Preview" : "View Product"}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </SectionBlock>

    <SectionBlock eyebrow="Build Log" title="How We Got Here" tone="panel">
      <p className="mb-8 max-w-2xl text-sm leading-[1.7] text-muted-foreground md:text-base">
        Dated and checkable. Every entry links to the thing it produced, so the claim and the
        evidence are never more than one click apart.
      </p>
      <BuildLog />
    </SectionBlock>

    <ConsultationCta />
  </PageShell>
);

export default ProductsIndex;
