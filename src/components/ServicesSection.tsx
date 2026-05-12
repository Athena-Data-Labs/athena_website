import { motion } from "framer-motion";
import { Zap, BarChart3, Brain, Database } from "lucide-react";
import { ArrowRight } from "lucide-react";

const services = [
  {
    icon: BarChart3,
    title: "Business Intelligence",
    description:
      "Executive-grade intelligence dashboards unifying live KPIs, predictive modeling, anomaly alerts, and real-time decision support in one command center.",
  },
  {
    icon: Zap,
    title: "AI Agents & Automation",
    description:
      "Autonomous intelligent agents for decision support, risk analysis, and recommendation generation. Context-aware guidance that moves teams from metrics to confident actions.",
  },
  {
    icon: Brain,
    title: "Predictive Analytics",
    description:
      "Production ML systems for forecasting, anomaly detection, and risk prediction that elevate decision speed and accuracy. Data-driven insights at scale.",
  },
  {
    icon: Database,
    title: "Data Architecture",
    description:
      "Clean, trusted, always-available data infrastructure. Reliable ingestion, transformation, and serving pipelines built for enterprise analytics.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6, 
      delay: i * 0.15,
      ease: [0.21, 0.47, 0.32, 0.98] as const
    },
  }),
};

const ServicesSection = () => {
  return (
    <section id="services" className="relative py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mb-12 text-center"
        >
          <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
            What We Deliver
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Delivery Capabilities
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground leading-relaxed md:text-lg md:leading-[1.65]">
            From business intelligence dashboards to AI-driven agents, we deliver the complete
            decision intelligence stack so your organization moves from data to confident decisions.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group glass rounded-xl border border-border/50 p-8 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)] hover:bg-secondary/30"
            >
              <div className="mb-5 inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <service.icon size={24} />
              </div>
              <h3 className="mb-3 font-display text-lg font-semibold leading-tight">{service.title}</h3>
              <p className="text-sm leading-[1.7] text-muted-foreground">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="mb-4 text-muted-foreground">Want to discuss how these capabilities apply to your organization?</p>
          <a href="#contact" onClick={(e) => {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
          }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)] hover:-translate-y-0.5">
            Schedule a Consultation <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
