import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { services } from "@/content";
import { contentIcons } from "@/components/content-icons";

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="relative border-b border-white/[0.06] py-12 md:py-20 bg-[#0a0c10]"
    >

      <div className="container relative z-10 mx-auto px-6">
        {/* ── Section header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 md:mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
              Capability Stack
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Delivering Capabilities
            </h2>
            <div className="mt-3 h-px w-16 bg-primary/40" />
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Six disciplines, from dashboards to AI agents. The same stack we use to build
              our own products.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 transition-colors hover:text-primary"
          >
            All Services <ArrowRight size={14} />
          </Link>
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
            {services.map((service, i) => {
              const Icon = contentIcons[service.icon];
              return (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link
                    to={`/services/${service.slug}`}
                    className="group relative flex items-start gap-5 px-7 py-6 transition-colors duration-200 hover:bg-white/[0.025]"
                  >
                    {/* Left accent bar on hover */}
                    <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100" />

                    {/* Icon */}
                    <div className="mt-0.5 flex-shrink-0 text-primary">
                      {Icon && <Icon size={18} />}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-base font-semibold leading-tight tracking-tight text-foreground">
                          {service.name}
                        </h3>
                        <span className="flex-shrink-0 font-mono text-[9px] tracking-[0.16em] text-white/30">
                          {service.tag}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">
                        {service.summary}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className="mt-1 flex-shrink-0 text-primary/20 transition-colors duration-200 group-hover:text-primary/60"
                    />
                  </Link>
                </motion.div>
              );
            })}
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
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                System // Signal
              </p>
              <p className="mt-2 font-display text-sm font-semibold text-foreground">
                The Pipeline
              </p>
            </div>

            {/* Stack layers — terse system readout */}
            {["Collect", "Model", "Decide", "Act"].map((label, i) => (
              <div
                key={label}
                className="group border-b border-white/[0.04] px-6 py-4 transition-colors hover:bg-white/[0.025]"
              >
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-none bg-primary/40 transition-colors group-hover:bg-primary" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                    {label}
                  </span>
                  <span className="ml-auto font-mono text-[9px] text-primary/30">0{i + 1}</span>
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-auto p-6">
              <Link
                to="/contact"
                data-umami-event="schedule-consultation"
                className="inline-flex w-full items-center justify-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Schedule a Consultation <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
