import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Shield, ShieldCheck, ArrowRight } from "lucide-react";
import { DUR, EASE } from "@/lib/motion";

type Pillar = {
  icon: typeof Zap;
  title: string;
  description: string;
  /** Pillars with something to prove link to the proof. */
  to?: string;
  linkLabel?: string;
};

const pillars: Pillar[] = [
  {
    icon: Zap,
    title: "Business Intelligence First",
    description:
      "Analytics dashboards and decision support systems designed for executive confidence and real-time insight.",
  },
  {
    icon: Shield,
    title: "Intelligent Automation",
    description:
      "AI agents and autonomous systems that augment human decision-making with predictive power and contextual guidance.",
  },
  {
    // The strongest thing we can say about how we build, and it was buried three
    // levels deep in a case study. It is a purchasing criterion in fintech and
    // GovCon, so it belongs on the homepage with a link to the architecture.
    icon: ShieldCheck,
    title: "Privacy as Architecture",
    description:
      "You can't leak what you never stored. Our backends hold as little as possible for as short a time as possible. A security strategy, not a policy page.",
    to: "/resources/field-notes/privacy-first-architecture-security",
    linkLabel: "Read the architecture",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative z-10 border-b border-foreground/[0.06] panel py-12 md:py-20">
      <div className="container relative mx-auto px-6">
        <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: DUR.reveal, ease: EASE }}
            className="flex flex-col border border-foreground/[0.08] bg-surface px-8 py-10 lg:px-10"
          >
            <p className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-meta">
              <span className="h-3 w-[2px] shrink-0 accent-bar" />
              Why Athena
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              We Ship What We{" "}
              <span className="text-gradient">Build</span>
            </h2>
            <div className="mt-3 mb-5 h-px w-16 accent-rule" />
            <p className="text-lg leading-[1.75] text-muted-foreground">
              Athena Data Labs builds decision intelligence systems for companies that have the
              data but not the picture: small finance teams, founders running on spreadsheets,
              and government contractors deciding what to bid on. Careful engineering, honest
              forecasting, and automation that keeps a person in the loop.
            </p>
            <p className="mt-5 text-base font-medium italic leading-relaxed text-steel">
              Every product on this site, we built and shipped ourselves.
            </p>

            {/* The founder's record is the least copyable thing here and it was
                only on /about. One line, then the door to the full story. */}
            <div className="mt-auto border-t border-foreground/[0.07] pt-6">
              <p className="text-sm leading-[1.7] text-muted-foreground">
                Founded by a war refugee turned Marine platoon sergeant turned Department of
                Defense operations research analyst. Ten years modeling multi-billion-dollar
                program decisions, and an M.S. in Physics with peer-reviewed research behind it.
              </p>
              <Link
                to="/about"
                data-umami-event="about-founder"
                className="group mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel transition-colors hover:text-foreground"
              >
                The full record
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          <div className="flex flex-col border border-l-0 border-foreground/[0.08] bg-surface-sunken lg:rounded-l-none">
            {pillars.map((pillar, i) => {
              const inner = (
                <>
                  <div className="flex-shrink-0 text-steel">
                    <pillar.icon size={22} />
                  </div>
                  <div>
                    <h3 className="mb-1 font-display text-base font-semibold leading-tight">{pillar.title}</h3>
                    <p className="text-sm leading-[1.65] text-muted-foreground">{pillar.description}</p>
                    {pillar.linkLabel && (
                      <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-meta-quiet transition-colors group-hover:text-steel">
                        {pillar.linkLabel}
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>
                </>
              );

              const className =
                "group flex gap-5 border-b border-foreground/[0.05] px-6 py-6 transition-all duration-300 last:border-b-0 hover:bg-foreground/[0.025]";

              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: DUR.reveal, delay: i * 0.1, ease: EASE }}
                  whileHover={{ x: 5, transition: { duration: DUR.quick, ease: EASE } }}
                  className="flex flex-col"
                >
                  {pillar.to ? (
                    <Link to={pillar.to} className={className}>
                      {inner}
                    </Link>
                  ) : (
                    <div className={className}>{inner}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
