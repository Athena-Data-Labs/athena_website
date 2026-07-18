import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp } from "lucide-react";

const pillars = [
  {
    icon: Zap,
    title: "Business Intelligence First",
    description: "Analytics dashboards and decision support systems designed for executive confidence and real-time insight.",
  },
  {
    icon: Shield,
    title: "Intelligent Automation",
    description: "AI agents and autonomous systems that augment human decision-making with predictive power and contextual guidance.",
  },
  {
    icon: TrendingUp,
    title: "Data-Driven Execution",
    description: "Every system is instrumented for insights. Continuous optimization based on real outcomes and feedback.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative z-10 border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-20">
      <div className="container relative mx-auto px-6">
        <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="border border-white/[0.08] bg-[hsl(213,38%,9%)] px-8 py-10 lg:px-10"
          >
            <p className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
              Why Athena
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              We Ship What We{" "}
              <span className="text-gradient">Build</span>
            </h2>
            <div className="mt-3 mb-5 h-px w-16 bg-primary/40" />
            <p className="text-lg leading-[1.75] text-muted-foreground">
              Athena Data Labs builds business intelligence platforms and AI agents for companies
              that have the data but not the picture. Careful engineering, honest forecasting, and
              automation that keeps a person in the loop.
            </p>
            <p className="mt-5 text-base font-medium text-primary/90 italic leading-relaxed">
              Every product on this site, we built and shipped ourselves.
            </p>
          </motion.div>

          <div className="flex flex-col border border-l-0 border-white/[0.08] bg-[hsl(213,42%,6%)] lg:rounded-l-none">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] as const }}
                whileHover={{ x: 5, transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as const } }}
                className="flex gap-5 border-b border-white/[0.05] px-6 py-6 transition-all duration-300 hover:bg-white/[0.025] last:border-b-0"
              >
                <div className="flex-shrink-0 text-primary">
                  <pillar.icon size={22} />
                </div>
                <div>
                  <h3 className="mb-1 font-display text-base font-semibold leading-tight">{pillar.title}</h3>
                  <p className="text-sm leading-[1.65] text-muted-foreground">{pillar.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
