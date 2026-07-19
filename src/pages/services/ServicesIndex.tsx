import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ConsultationCta from "@/components/ConsultationCta";
import { services } from "@/content";
import { contentIcons } from "@/components/content-icons";

const ServicesIndex = () => {
  return (
    <PageShell
      eyebrow="Services"
      title={
        <>
          Six Disciplines, One <span className="text-gradient">Delivery Standard</span>
        </>
      }
      intro="Everything from cleaning a messy spreadsheet to shipping an AI agent, each service grounded in systems we've built and run ourselves."
    >
      <Seo
        title="Services: Data Analytics, AI, Dashboards & Forecasting"
        description="Athena Data Labs consulting services: data analytics, AI solutions, executive dashboards, forecasting, Excel automation, and operations research. Production-grade delivery."
        path="/services"
        image="/og/services.png"
        bare
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = contentIcons[service.icon];
              return (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Link
                    to={`/services/${service.slug}`}
                    className="group flex h-full flex-col bg-[#0a0c10] p-7 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between">
                      {Icon && <Icon size={20} className="text-primary" />}
                      <span className="font-mono text-[9px] tracking-[0.16em] text-white/30">{service.tag}</span>
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                      {service.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-[1.65] text-muted-foreground">{service.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors group-hover:text-primary">
                      Explore Service <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
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

export default ServicesIndex;
