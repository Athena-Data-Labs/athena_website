import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ConsultationCta from "@/components/ConsultationCta";
import BuildLog from "@/components/BuildLog";
import SectionBlock from "@/components/page/SectionBlock";
import { products } from "@/content";
import { contentIcons, productImages } from "@/components/content-icons";
import ProductMark from "@/components/ProductMark";
import { DUR, EASE } from "@/lib/motion";

/**
 * One lineup, four equal rows. Every product is something we shipped and run,
 * so none of them gets promoted above the others here — the detail pages are
 * where each one makes its own case.
 */
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
      description="Four products we built, shipped and run: Aegis BI on the App Store and web from $50/mo, MyBudgetNerd for iPhone, Thera for GovCon capture, and ANN Studio."
      path="/products"
      image="/og/products.png"
      bare
    />

    <section className="border-b border-foreground/[0.06] panel py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-px border border-foreground/[0.07] bg-foreground/[0.05]">
          {products.map((product, i) => {
            const img = productImages[product.icon];
            const Icon = contentIcons[product.icon];
            return (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: DUR.reveal, delay: i * 0.07, ease: EASE }}
              >
                <Link
                  to={`/products/${product.slug}`}
                  className="group flex h-full flex-col gap-6 bg-background p-8 transition-colors hover:bg-foreground/[0.02] md:flex-row md:items-center md:p-10"
                >
                  <div className="flex items-center gap-5 md:w-[340px] md:shrink-0">
                    {img ? (
                      <ProductMark
                        icon={product.icon}
                        alt={`${product.name} icon`}
                        className="h-14 w-14 shrink-0 object-contain"
                      />
                    ) : (
                      Icon && (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-steel/25 text-steel">
                          <Icon size={26} />
                        </div>
                      )
                    )}
                    <div>
                      {/* `items-center` centres the dot against the whole
                          block, which is right until the tag wraps — at 390px
                          "Flagship · In Production" takes two lines and the dot
                          drops to the gap between them. Pinned to the first
                          line instead: one line box tall, dot centred in it. */}
                      <p className="flex items-start gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-meta-quiet">
                        <span className="flex h-[1.55em] shrink-0 items-center">
                          <span className="h-1 w-1 rounded-full bg-steel" />
                        </span>
                        {product.tag}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                        {product.name}
                      </h2>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {product.tagline}
                      </p>
                      {product.priceLabel && (
                        <p className="mt-2 font-mono text-[11px] tracking-[0.06em] text-steel">
                          {product.priceLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="flex-1 text-sm leading-[1.7] text-muted-foreground md:text-base">
                    {product.summary}
                  </p>

                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-meta transition-colors group-hover:text-steel">
                    View Product
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>

    <SectionBlock eyebrow="Build Log" title="How We Got Here">
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
