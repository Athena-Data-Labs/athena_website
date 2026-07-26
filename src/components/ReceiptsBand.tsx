import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/content";

/**
 * The answer to "can you actually do this?", placed where the question gets
 * asked — immediately after the service list.
 *
 * With no third-party client roster, this band is the trust layer: every
 * discipline we sell has already produced something running in production, and
 * each row links to it. An agency with a deck cannot reproduce this page, which
 * is the entire point of running it here rather than burying it in a case study.
 */
const ReceiptsBand = () => (
  <section id="receipts" className="relative z-10 border-b border-white/[0.06] panel py-12 md:py-20">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-10 max-w-2xl"
      >
        <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
          <span className="h-3 w-[2px] shrink-0 bg-steel" />
          Our Own Hardest Client
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Every Service Here Has{" "}
          {/* Own line on desktop: the natural wrap orphans "Shipped". */}
          <span className="text-gradient md:block">Already Shipped</span>
        </h2>
        <div className="mt-3 h-px w-16 bg-steel/40" />
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Six disciplines, and the thing each one has already produced. Not a capability list —
          software running in production, with a link to go and look at every one of them.
        </p>
      </motion.div>

      <div className="border-t border-white/[0.07]">
        {services.map((service, i) => (
          <motion.div
            key={service.slug}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25), ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link
              to={`/services/${service.slug}`}
              data-umami-event="receipt-service"
              className="group grid items-baseline gap-x-8 gap-y-1.5 border-b border-white/[0.07] py-5 transition-colors hover:bg-white/[0.02] md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:py-6"
            >
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                  {service.tag}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
                  {service.name}
                </h3>
              </div>

              <p className="text-sm leading-[1.6] text-muted-foreground">
                <span className="text-steel/90">{service.workedExample.label}</span>
                <span className="hidden text-white/25 md:inline"> — </span>
                <span className="block md:inline">{service.summary}</span>
              </p>

              <span className="hidden shrink-0 text-white/25 transition-colors group-hover:text-steel md:block">
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
        No invented clients and no borrowed logos. Everything above is ours, in production, and
        open to inspection.
      </p>
    </div>
  </section>
);

export default ReceiptsBand;
