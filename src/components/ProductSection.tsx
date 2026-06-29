import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, ScanSearch, TrendingUp } from "lucide-react";

const AppStoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.4 18.2h7.2" />
    <path d="M9.7 6.2 16.8 18.2" />
    <path d="M14.3 6.2 7.2 18.2" />
    <path d="M5.6 13.5h12.8" opacity="0.85" />
  </svg>
);

const features = [
  { icon: ScanSearch, label: "Automated Statement Parsing" },
  { icon: TrendingUp, label: "Forecasting Engine" },
  { icon: BrainCircuit, label: "ML Categorization Pipeline" },
];

const ProductSection = () => {
  return (
    <section id="products" className="relative overflow-hidden border-b border-white/[0.06] bg-[#0a0c10]">

      <div className="container relative z-10 mx-auto px-6 pt-20 pb-4">
        <div className="grid min-h-[650px] grid-cols-1 items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative z-20 flex flex-col justify-center border border-white/[0.08] bg-[hsl(213,38%,9%)] px-8 py-10 lg:px-10 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                <span className="h-3.5 w-[2px] shrink-0 bg-primary" />
                Product Showcase · Live Capability Demo
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-5 font-display text-5xl font-bold leading-[1.06] tracking-tight text-white md:text-6xl lg:text-7xl lg:mr-[-5rem] relative z-30"
            >
              Proof of
              <span className="text-gradient"> Delivery</span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-5 mb-4 h-px w-20 origin-left bg-primary/40"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="max-w-[56ch] text-base leading-[1.75] text-muted-foreground md:text-lg md:leading-[1.8]"
            >
              MyBudgetNerd is a production business intelligence product we designed and shipped end to
              end: real-time financial analysis,
              intelligent transaction classification, and AI-powered insights including{" "}
              <span className="text-primary font-medium">anomaly detection</span>,{" "}
              <span className="text-primary font-medium">forecasting</span>, and{" "}
              <span className="text-primary font-medium">contextual recommendations</span>.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-3 max-w-[56ch] text-sm leading-[1.7] text-muted-foreground/60"
            >
              Built with React + FastAPI and deployed on AWS (Amplify + Elastic Beanstalk).
              Intelligent automation with human-in-the-loop refinement. AI agents provide
              context-aware recommendations while maintaining user control and transparency.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
            >
              {features.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
                >
                  <f.icon size={14} className="text-primary" />
                  {f.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-7"
            >
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://apps.apple.com/us/app/mybudgetnerd/id6761061061"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <AppStoreIcon /> See MyBudgetNerd on the App Store <ArrowRight size={16} />
                </a>

                <a
                  href="https://mybudgetnerd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/10 bg-transparent px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-primary/40"
                >
                  Visit the Website <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="relative flex items-stretch justify-center border border-l-0 border-white/[0.08] bg-[hsl(213,42%,6%)] lg:rounded-l-none">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative flex w-full flex-col p-6"
            >
              <div className="mb-4 flex items-center justify-between border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary/70">Live Product</p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary/60" />
                  <span className="h-2 w-2 bg-white/10" />
                </div>
              </div>
              <div
                className="relative flex-1 min-h-[520px] overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,8%)]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-primary/80">MyBudgetNerd Demo</p>
                    <p className="mt-1 text-xs text-muted-foreground">Available now for iPhone users worldwide.</p>
                  </div>
                </div>
                <iframe
                  src="https://mybudgetnerd.com"
                  title="MyBudgetNerd Demo"
                  className="block h-full w-full border-0 bg-[hsl(213,40%,8%)]"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-4 border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                Live preview of MyBudgetNerd, embedded directly from the production site.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default ProductSection;
