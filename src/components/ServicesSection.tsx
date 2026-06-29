import { motion } from "framer-motion";
import { Zap, BarChart3, Brain, Database, ArrowRight, ChevronRight } from "lucide-react";

const services = [
  {
    icon: BarChart3,
    title: "Business Intelligence",
    tag: "BI // 01",
    description:
      "Executive-grade intelligence dashboards unifying live KPIs, predictive modeling, anomaly alerts, and real-time decision support in one command center.",
  },
  {
    icon: Zap,
    title: "AI Agents & Automation",
    tag: "AGENTS // 02",
    description:
      "Autonomous intelligent agents for decision support, risk analysis, and recommendation generation. Context-aware guidance that moves teams from metrics to confident actions.",
  },
  {
    icon: Brain,
    title: "Predictive Analytics",
    tag: "ML // 03",
    description:
      "Production ML systems for forecasting, anomaly detection, and risk prediction that elevate decision speed and accuracy. Data-driven insights at scale.",
  },
  {
    icon: Database,
    title: "Data Architecture",
    tag: "INFRA // 04",
    description:
      "Clean, trusted, always-available data infrastructure. Reliable ingestion, transformation, and serving pipelines built for enterprise analytics.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="relative border-b border-white/[0.06] py-20 bg-[#0a0c10]"
    >

      <div className="container relative z-10 mx-auto px-6">
        {/* ── Section header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-14"
        >
          <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-3 w-[2px] shrink-0 bg-primary" />
            Capability Stack
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Delivering Capabilities
          </h2>
          <div className="mt-3 h-px w-16 bg-primary/40" />
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            From business intelligence dashboards to AI-driven agents — the complete decision
            intelligence stack, production-ready.
          </p>
        </motion.div>

        {/* ── Asymmetric 65 / 35 grid ──────────────────────── */}
        <div className="grid grid-cols-1 items-stretch gap-0 lg:grid-cols-[1fr_300px]">

          {/* Left column — service rows ─────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="divide-y divide-white/[0.05] border border-white/[0.06] bg-[hsl(213,38%,9%)]"
          >
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="group relative flex items-start gap-5 px-7 py-6 transition-colors duration-200 hover:bg-white/[0.025]"
              >
                {/* Left accent bar on hover */}
                <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />

                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0 text-primary">
                  <service.icon size={18} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-base font-semibold leading-tight tracking-tight text-foreground">
                      {service.title}
                    </h3>
                    <span className="flex-shrink-0 font-mono text-[9px] tracking-[0.16em] text-primary/40">
                      {service.tag}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="mt-1 flex-shrink-0 text-primary/20 transition-colors duration-200 group-hover:text-primary/60"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Right sidebar — 35% ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-px border border-l-0 border-white/[0.06] bg-[hsl(213,42%,6%)] lg:rounded-l-none"
          >
            {/* Sidebar header */}
            <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary/50">
                System // Signal
              </p>
              <p className="mt-2 font-display text-sm font-semibold text-foreground">
                Decision Intelligence
              </p>
            </div>

            {/* Stack layers */}
            {[
              { label: "Collect", desc: "Real-time data ingestion & unification" },
              { label: "Model",   desc: "ML forecasting & anomaly detection" },
              { label: "Decide",  desc: "AI-guided recommendations & alerts" },
              { label: "Act",     desc: "Workflow automation & operator control" },
            ].map((layer, i) => (
              <div
                key={layer.label}
                className="group border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.025]"
              >
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-none bg-primary/40 transition-colors group-hover:bg-primary" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                    {layer.label}
                  </span>
                  <span className="ml-auto font-mono text-[9px] text-primary/30">0{i + 1}</span>
                </div>
                <p className="mt-1.5 pl-[18px] text-[11px] leading-relaxed text-muted-foreground/60">
                  {layer.desc}
                </p>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-auto p-6">
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground/60">
                Ready to apply this stack to your organization?
              </p>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Schedule a Consultation <ArrowRight size={13} />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
