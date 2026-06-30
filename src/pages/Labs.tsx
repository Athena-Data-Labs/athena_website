import { lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LabsSection = lazy(() => import("@/components/LabsSection"));
const ProductSection = lazy(() => import("@/components/ProductSection"));
const CtaSection = lazy(() => import("@/components/CtaSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

const Labs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Athena Labs — Aegis BI, MyBudgetNerd & ANN Builder"
        description="Explore the live AI products Athena Data Labs has shipped: Aegis BI financial intelligence with the Glaukos AI analyst, the MyBudgetNerd iOS app on the App Store, and the ANN Builder neural-network studio."
        path="/labs"
        bare
      />
      <Navbar />

      <header className="relative border-b border-white/[0.06] bg-[#0a0c10] pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} /> Athena Data Labs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-8 max-w-3xl"
          >
            <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
              <span className="h-3.5 w-[2px] shrink-0 bg-primary" />
              Athena Labs
            </span>
            <h1 className="mt-5 font-display text-4xl font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
              Live Products &amp; <span className="text-gradient">Proof of Delivery</span>
            </h1>
            <div className="mt-5 h-px w-24 bg-primary/40" />
            <p className="mt-5 max-w-2xl text-base leading-[1.72] text-slate-100/90 md:text-lg">
              The intelligence products we&apos;ve designed, built, and shipped to production —
              a flagship BI platform with a built-in AI analyst, a consumer finance app on the
              App Store, and interactive machine-learning tools. Explore each one live.
            </p>
          </motion.div>
        </div>
      </header>

      <Suspense fallback={<SectionFallback />}>
        <LabsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ProductSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CtaSection />
      </Suspense>

      <Footer />
    </div>
  );
};

export default Labs;
