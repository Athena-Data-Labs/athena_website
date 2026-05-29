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
    <section id="products" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(213,40%,6%)] to-[hsl(213,40%,6%)]" />
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/3 -translate-y-1/4 w-[900px] h-[900px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.07) 0%, hsl(var(--primary) / 0.02) 40%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto px-6 pt-16 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-0 items-stretch min-h-[650px]">
          {/* Left */}
          <div className="flex flex-col justify-center lg:pr-12 relative z-20">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary/20 to-primary/10 hidden lg:block" />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="inline-block rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
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
              className="mt-5 mb-4 h-px w-20 origin-left bg-gradient-to-r from-primary/60 to-transparent"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="max-w-[56ch] text-base leading-[1.75] text-muted-foreground md:text-lg md:leading-[1.8]"
            >
              MyBudgetNerd is now featured on the App Store—a milestone that demonstrates how we
              deliver business intelligence systems: real-time financial analysis,
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
              transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-2 max-w-[56ch] text-xs leading-relaxed"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <AppStoreIcon /> App Store Milestone
              </span>
              <p className="mt-2 text-muted-foreground/70">Available now for iPhone users worldwide.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-5 flex flex-wrap gap-3"
            >
              {features.map((f) => (
                <span
                  key={f.label}
                  className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground"
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
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold tracking-wide text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative z-10 flex items-center gap-2">
                    <AppStoreIcon /> See MyBudgetNerd on the App Store <ArrowRight size={16} />
                  </span>
                </a>

                <a
                  href="https://mybudgetnerd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/20 px-6 py-3.5 text-sm font-semibold tracking-wide text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10"
                >
                  Visit the Website <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right: Phone mockup */}
          <div className="relative flex items-end justify-center lg:justify-end">
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[320px] h-[560px] sm:w-[400px] sm:h-[700px] pointer-events-none"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative w-[340px]"
            >
              <div
                className="w-full overflow-hidden rounded-[2.5rem] border-[3px] border-border/30"
                style={{
                  aspectRatio: "9 / 19.5",
                  boxShadow: "0 40px 100px hsl(var(--primary) / 0.12), 0 15px 40px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.05)",
                }}
              >
                <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[hsl(213,40%,6%)]" />
                <iframe
                  src="https://mybudgetnerd.com"
                  title="MyBudgetNerd Demo"
                  className="h-full w-full border-0"
                  style={{ background: "hsl(213, 40%, 8%)", display: "block" }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="lazy"
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-4 text-center text-xs text-muted-foreground"
              >
                Explore the app preview and open the App Store listing to download the official release.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
};

export default ProductSection;
