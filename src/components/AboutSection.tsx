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
    <section id="about" className="relative py-16">
      <div className="absolute inset-0 bg-glow pointer-events-none animate-pulse-glow" />
      <div className="container relative mx-auto px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Why Athena
            </p>
            <h2 className="mb-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Strategy Meets{" "}
              <span className="text-gradient">Execution</span>
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Athena Data Labs delivers business intelligence systems and AI agents that turn data
              into confident decisions. We combine disciplined engineering, predictive analytics,
              and intelligent automation to move organizations from metrics to action.
            </p>
            <p className="mt-4 text-base font-medium text-primary/90 italic">
              Decision intelligence. Built to scale. Defense-informed rigor.
            </p>
          </motion.div>

          <div className="flex flex-col gap-5">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
                className="flex gap-5 rounded-xl glass p-6"
              >
                <div className="flex-shrink-0 rounded-lg bg-primary/10 p-3 text-primary">
                  <pillar.icon size={22} />
                </div>
                <div>
                  <h3 className="mb-1 font-display text-base font-semibold">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
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
