import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { scrollToSectionById } from "@/lib/scroll";

const HeroSection = () => {
  // Transparent window onto the fixed NeuralBackdrop plane rendered by the homepage
  return (
    <section className="relative z-10 flex min-h-[86vh] items-center border-b border-white/[0.06] pt-24 pb-12 md:pb-20 bg-transparent">
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="h-3.5 w-[2px] shrink-0 bg-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/55">
            Business Intelligence · AI Agents · Data Science
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="max-w-4xl break-keep font-display text-5xl font-black leading-[0.95] tracking-[-0.035em] text-white sm:text-6xl lg:text-[5.35rem]"
        >
          Transforming Data Into <span className="text-gradient">Intelligent Products</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="mt-5 mb-5 h-px w-24 origin-left bg-primary/40"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="max-w-2xl text-base leading-[1.72] text-slate-100/92 md:text-lg md:leading-[1.78]"
        >
          We build data products end to end: machine-learning applications, forecasting
          systems, and the dashboards a business actually runs on. Shipped to production,
          and answerable for what they do.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="mt-8 flex flex-col gap-4 sm:flex-row"
        >
          <Button variant="hero" size="lg" asChild>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSectionById("contact");
              }}
            >
              Talk to Us <ArrowRight className="ml-1" size={18} />
            </a>
          </Button>
          <Button variant="heroOutline" size="lg" asChild>
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSectionById("services");
              }}
            >
              See What We Deliver
            </a>
          </Button>
        </motion.div>

        {/* Social proof — in-flow on small screens, pinned to the hero's bottom-right on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.78, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-slate-300/85 lg:hidden"
        >
          <TrustSignals />
        </motion.div>
      </div>

      {/* Desktop placement: bottom-right, aligned to the container grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.78, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="absolute inset-x-0 bottom-8 hidden lg:block"
      >
        <div className="container mx-auto flex items-center justify-end gap-x-5 px-6 text-xs font-medium text-slate-300/85">
          <TrustSignals />
        </div>
      </motion.div>
    </section>
  );
};

const TrustSignals = () => (
  <>
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      Live SaaS in production
    </span>
    <span className="hidden h-3.5 w-px bg-white/15 sm:block" />
    <span className="flex items-center gap-1.5">
      <Star size={13} className="fill-primary text-primary" />
      5.0 on the App Store
    </span>
    <span className="hidden h-3.5 w-px bg-white/15 sm:block" />
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      Engineered on AWS
    </span>
  </>
);

export default HeroSection;
