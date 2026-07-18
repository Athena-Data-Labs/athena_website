import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { products } from "@/content";
import { contentIcons, productImages } from "@/components/content-icons";

const ProofTeaser = () => {
  return (
    <section id="products" className="relative border-b border-white/[0.06] py-12 md:py-20 bg-[#0a0c10]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 md:mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
              Proof of Delivery
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Products We&apos;ve Built &amp; Shipped
            </h2>
            <div className="mt-3 h-px w-16 bg-primary/40" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Not a portfolio of concepts: a flagship BI platform in beta, a finance app live on
              the App Store, a hands-on ML studio — and our next platform already in development.
            </p>
          </div>
          <Link
            to="/products"
            data-umami-event="explore-products"
            className="inline-flex shrink-0 items-center gap-2 bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explore Products <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => {
            const img = productImages[p.icon];
            const Icon = contentIcons[p.icon];
            const inner = (
              <>
                <div className="flex items-center gap-3">
                  {img ? (
                    <img
                      src={img}
                      alt={`${p.name} icon`}
                      className="h-11 w-11 shrink-0 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    Icon && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-primary/25 text-primary">
                        <Icon size={22} />
                      </div>
                    )
                  )}
                  <div>
                    <h3 className="font-display text-lg font-semibold leading-tight tracking-tight text-foreground">
                      {p.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                      <span className="h-1 w-1 rounded-full bg-primary" /> {p.tag}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-[1.65] text-muted-foreground">
                  {p.summary}
                </p>
                {p.comingSoon ? (
                  <span className="mt-5 inline-flex w-fit items-center gap-1.5 border border-primary/30 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary/80">
                    Coming Soon
                  </span>
                ) : (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors group-hover:text-primary">
                    View Product <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </>
            );
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full"
              >
                {p.comingSoon ? (
                  <div className="flex h-full flex-col bg-[#0a0c10] p-7">{inner}</div>
                ) : (
                  <Link
                    to={`/products/${p.slug}`}
                    className="group flex h-full flex-col bg-[#0a0c10] p-7 transition-colors hover:bg-white/[0.02]"
                  >
                    {inner}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProofTeaser;
