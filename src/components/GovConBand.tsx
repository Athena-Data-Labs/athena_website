import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { capability, certifications, entity } from "@/content";
import { CTA_PRIMARY, CTA_SECONDARY } from "@/lib/cta";
import { DUR, EASE } from "@/lib/motion";

/**
 * Federal contracting, on the front page.
 *
 * The homepage sold four products and six disciplines and never once said the
 * studio is a certified small business that bids federal work — which is the
 * line of business the company expects to live on. Somebody arriving from a
 * SAM.gov search, an OSDBU list, or a prime's supplier hunt had no signal at
 * all that they were in the right place.
 *
 * Deliberately a short band rather than another full section: it is a signpost
 * to the capability statement, not a replacement for it. The four facts here
 * are the ones that decide whether a reader keeps going, and all four are read
 * from the SAM.gov registration through content.
 */
const facts = [
  { label: "Certifications", value: certifications.map((c) => c.abbr).join(" · ") },
  { label: "SAM.gov", value: `${entity.sam.status} · ${entity.sam.purpose}` },
  { label: "Primary NAICS", value: entity.naics.find((n) => n.primary)?.code ?? "", mono: true },
  { label: "CAGE", value: entity.cage, mono: true },
];

const GovConBand = () => (
  <section id="govcon" className="panel relative z-10 border-b border-foreground/[0.06] py-12 md:py-20">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: DUR.reveal, ease: EASE }}
        className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16"
      >
        <div>
          <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
            <span className="h-3 w-[2px] shrink-0 bg-steel" />
            Government Contracting
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            An SBA-Certified <span className="text-gradient">SDVOSB</span>
          </h2>
          <div className="mt-3 h-px w-16 bg-steel/40" />
          <p className="mt-5 max-w-xl text-sm leading-[1.75] text-muted-foreground md:text-base">
            Athena Analytics is certified by the Small Business Administration as a
            Service-Disabled Veteran-Owned Small Business and a Veteran-Owned Small Business,
            registered in SAM.gov for all awards. We bid as a prime and we team as a subcontractor.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-[1.75] text-muted-foreground md:text-base">
            We are not new to this market from the outside. Thera, one of the products above, is
            capture intelligence software running in production for federal contractors &mdash;
            live notices, set-aside eligibility, bid decisions &mdash; and the founder spent ten
            years as an operations research analyst supporting Army programs.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/government" data-umami-event="home-capability-statement" className={CTA_PRIMARY}>
              Capability Statement
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact#federal" data-umami-event="home-teaming" className={CTA_SECONDARY}>
              Teaming Inquiry
            </Link>
          </div>
        </div>

        <div>
          <dl className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="bg-background px-6 py-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
                  {f.label}
                </dt>
                <dd className={`mt-2 text-sm text-foreground ${f.mono ? "font-mono tracking-[0.08em]" : ""}`}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-6 space-y-3">
            {capability.competencies.slice(0, 4).map((c) => (
              <li key={c.title} className="flex items-start gap-3 text-sm text-muted-foreground">
                <BadgeCheck size={15} className="mt-0.5 shrink-0 text-steel" />
                {c.title}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  </section>
);

export default GovConBand;
