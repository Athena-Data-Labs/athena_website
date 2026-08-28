import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/content";
import { contentIcons } from "@/components/content-icons";
import { DUR, EASE } from "@/lib/motion";

/**
 * What we sell, and the proof for each line of it.
 *
 * This used to be a list of six services next to a decorative "pipeline"
 * sidebar that said nothing. With no third-party client roster, the far better
 * use of the space is the answer to the question the list provokes — can you
 * actually do this? — so every row now carries the thing that discipline has
 * already produced, in production, one click away.
 *
 * The receipt text is `service.workedExample.label`, the same field the service
 * page renders, so the homepage claim and the detail page can never drift.
 */
const ServicesSection = () => (
  <section id="services" className="relative border-b border-foreground/[0.06] py-12 md:py-20 panel">
    <div className="container relative z-10 mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: DUR.reveal, ease: EASE }}
        className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
            <span className="h-3 w-[2px] shrink-0 bg-steel" />
            Capability Stack
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Every Service Here Has{" "}
            {/* Own line on desktop: the natural wrap orphans "Shipped". */}
            <span className="text-gradient md:block">Already Shipped</span>
          </h2>
          <div className="mt-3 h-px w-16 bg-steel/40" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Six disciplines, and the thing each one has already produced. Not a capability
            list: software running in production, with a link to go and look at every one.
          </p>
        </div>
        <Link
          to="/services"
          data-umami-event="home-all-services"
          className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel/80 transition-colors hover:text-steel"
        >
          All Services <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* One animation for the whole list rather than six: the rows are cheap,
          but six independent observers and transforms are not, and this section
          is on the scroll path of every visitor. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: DUR.reveal, ease: EASE }}
        className="border-t border-foreground/[0.07]"
      >
        {services.map((service) => {
          const Icon = contentIcons[service.icon];
          return (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              data-umami-event="home-service-row"
              className="group relative grid items-baseline gap-x-8 gap-y-1.5 border-b border-foreground/[0.07] py-5 transition-colors hover:bg-foreground/[0.02] md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] md:py-6"
            >
              <span className="absolute left-0 top-0 hidden h-full w-[2px] origin-top scale-y-0 bg-steel transition-transform duration-200 group-hover:scale-y-100 md:block" />

              <div className="flex items-baseline gap-3 md:pl-5">
                {Icon && (
                  <span className="shrink-0 translate-y-[3px] text-steel">
                    <Icon size={16} />
                  </span>
                )}
                <span>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-foreground/50">
                    {service.tag}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">
                    {service.name}
                  </h3>
                </span>
              </div>

              <p className="text-sm leading-[1.6] text-muted-foreground">
                <span className="text-steel/90">{service.workedExample.label}</span>
                <span className="hidden text-foreground/25 md:inline"> · </span>
                <span className="block md:inline">{service.summary}</span>
              </p>

              <span className="hidden shrink-0 text-foreground/25 transition-colors group-hover:text-steel md:block">
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </motion.div>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground/70">
          No invented clients and no borrowed logos. Everything above is ours, in production,
          and open to inspection.
        </p>
        <Link
          to="/contact"
          data-umami-event="schedule-consultation"
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Schedule a Consultation <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  </section>
);

export default ServicesSection;
