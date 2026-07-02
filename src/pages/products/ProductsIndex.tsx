import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ConsultationCta from "@/components/ConsultationCta";
import { products } from "@/content";
import { contentIcons, productImages } from "@/components/content-icons";

const ProductsIndex = () => {
  return (
    <PageShell
      eyebrow="Products"
      title={
        <>
          Live Products &amp; <span className="text-gradient">Proof of Delivery</span>
        </>
      }
      intro="The intelligence products we've designed and built — a flagship BI platform in closed beta with a built-in AI analyst, a consumer finance app live on the App Store, and interactive machine-learning tools. Explore each one live."
    >
      <Seo
        title="Products — Aegis BI, MyBudgetNerd & ANN Builder"
        description="Explore the live AI products Athena Data Labs has shipped: Aegis BI financial intelligence with the Glaukos AI analyst, the MyBudgetNerd iOS app on the App Store, and the ANN Builder neural-network studio."
        path="/products"
        bare
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col gap-px border border-white/[0.07] bg-white/[0.05]">
            {products.map((product, i) => {
              const img = productImages[product.icon];
              const Icon = contentIcons[product.icon];
              return (
                <motion.div
                  key={product.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link
                    to={`/products/${product.slug}`}
                    className="group flex h-full flex-col gap-6 bg-[#0a0c10] p-8 transition-colors hover:bg-white/[0.02] md:flex-row md:items-center md:p-10"
                  >
                    <div className="flex items-center gap-5 md:w-[340px] md:shrink-0">
                      {img ? (
                        <img src={img} alt={`${product.name} icon`} className="h-14 w-14 shrink-0 object-contain" loading="lazy" />
                      ) : (
                        Icon && (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-primary/25 text-primary">
                            <Icon size={26} />
                          </div>
                        )
                      )}
                      <div>
                        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/70">
                          <span className="h-1 w-1 rounded-full bg-primary" /> {product.tag}
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                          {product.name}
                        </h2>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                          {product.tagline}
                        </p>
                      </div>
                    </div>
                    <p className="flex-1 text-sm leading-[1.7] text-muted-foreground md:text-base">
                      {product.summary}
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary/70 transition-colors group-hover:text-primary">
                      View Product <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <ConsultationCta />
    </PageShell>
  );
};

export default ProductsIndex;
