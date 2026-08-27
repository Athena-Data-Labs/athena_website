import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { certifications, entity, SBA_VERIFY_URL } from "@/content";
import { CTA_PRIMARY } from "@/lib/cta";

/**
 * The teaming door, on the page where somebody already came to knock.
 *
 * A prime assembling a team and a company wanting a dashboard both land on
 * /contact, and until now the page only spoke to the second one. The two asks
 * need different things: the software buyer needs a form, and the prime needs
 * the four fields it takes to put a subcontractor on a bid, without an email
 * round-trip to ask for them.
 *
 * The identifiers are the seed of a capability statement rather than a copy of
 * one — they are read from content, so the day they appear on a capability
 * statement page the two cannot disagree.
 */
const rows = [
  { label: "Legal name", value: entity.legalName },
  { label: "DBA", value: entity.dba },
  { label: "UEI", value: entity.uei, mono: true },
  { label: "CAGE", value: entity.cage, mono: true },
  { label: "Certifications", value: certifications.map((c) => c.abbr).join(", ") },
  ...(entity.naics.length
    ? [{ label: "NAICS", value: entity.naics.map((n) => n.code).join(", "), mono: true }]
    : []),
];

const FederalTeaming = () => {
  const handleTeamingInquiry = () => {
    const subject = encodeURIComponent("Teaming / subcontracting inquiry");
    const body = encodeURIComponent(
      "Hi Athena Data Labs,\n\nAgency or prime:\nSolicitation or notice number:\nSet-aside:\nScope we would need covered:\nResponse date:\n"
    );
    window.open(`mailto:${entity.email}?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <section id="federal" className="relative z-10 py-12 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto max-w-5xl"
        >
          <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
            <span className="h-3 w-[2px] shrink-0 bg-steel" />
            Federal
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Teaming &amp; Subcontracting
          </h2>
          <div className="mt-3 h-px w-16 bg-steel/40" />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Athena Analytics LLC is certified by the U.S. Small Business Administration as an
            SDVOSB and a VOSB. We bid as a prime and we team as a subcontractor. If you are
            assembling a team against a live notice, everything you need to put us on it is
            below &mdash; and the fastest way to start is a note with the solicitation number in it.
          </p>

          <dl className="mt-8 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => (
              <div key={row.label} className="bg-background px-6 py-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                  {row.label}
                </dt>
                <dd
                  className={`mt-2 text-sm text-foreground ${
                    row.mono ? "font-mono tracking-[0.08em]" : ""
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              type="button"
              onClick={handleTeamingInquiry}
              data-umami-event="teaming-inquiry"
              className={CTA_PRIMARY}
            >
              Email a Teaming Inquiry
            </button>
            <a
              href={SBA_VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="verify-sba-certification"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:text-steel"
            >
              Verify in SBA&rsquo;s certification search
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FederalTeaming;
