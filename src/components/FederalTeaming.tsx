import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { certifications, entity, SBA_VERIFY_URL } from "@/content";
import { CTA_PRIMARY } from "@/lib/cta";

/**
 * The teaming door, on the page where somebody already came to knock.
 *
 * A prime assembling a team and a company wanting a dashboard both land on
 * /contact, and until now the page only spoke to the second one. The two asks
 * need different things: the software buyer needs a form, and the prime needs
 * the fields it takes to put a subcontractor on a bid, without an email round
 * trip to ask for them.
 *
 * Everything here is read from content, which is read from the SAM.gov
 * registration — so this block and a capability statement built later cannot
 * disagree, and neither can drift from the federal record.
 */
const identifiers = [
  { label: "Legal name", value: entity.legalName },
  { label: "DBA", value: entity.dba },
  { label: "UEI", value: entity.uei, mono: true },
  { label: "CAGE", value: entity.cage, mono: true },
  // Five cells in a three-column grid leaves a hole in the corner, and the hole
  // is not neutral: the filled cells are opaque and the gap shows the page
  // behind them. The last one takes the remaining width instead.
  { label: "Certifications", value: certifications.map((c) => c.abbr).join(" · "), wide: true },
];

/** NAICS and PSC are the same shape and get the same treatment. */
const CodeList = ({
  title,
  codes,
}: {
  title: string;
  codes: { code: string; label: string; primary?: boolean }[];
}) => (
  <div className="bg-background p-7">
    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">{title}</p>
    <ul className="mt-4 space-y-2.5">
      {codes.map((c) => (
        <li key={c.code + c.label} className="flex gap-3 text-sm leading-[1.5]">
          <span className="w-[3.6rem] shrink-0 font-mono text-foreground">{c.code}</span>
          <span className="text-muted-foreground">
            {c.label}
            {c.primary && (
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                Primary
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

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
            Athena Analytics is certified by the U.S. Small Business Administration as an SDVOSB
            and a VOSB, and registered in SAM.gov for all awards. We bid as a prime and we team as
            a subcontractor. Everything it takes to put us on a bid is below; the fastest way to
            start is a note with the solicitation number in it.
          </p>

          <dl className="mt-8 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {identifiers.map((row) => (
              <div
                key={row.label}
                className={`bg-background px-6 py-5 ${row.wide ? "lg:col-span-2" : ""}`}
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
                  {row.label}
                </dt>
                <dd
                  className={`mt-2 text-sm text-foreground ${row.mono ? "font-mono tracking-[0.08em]" : ""}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-px grid gap-px border-x border-b border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-2">
            <CodeList title="NAICS Codes" codes={entity.naics} />
            <CodeList title="PSC Codes" codes={entity.psc} />
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
            <button
              type="button"
              onClick={handleTeamingInquiry}
              data-umami-event="teaming-inquiry"
              className={CTA_PRIMARY}
            >
              Email a Teaming Inquiry
            </button>
            <Link
              to="/government"
              data-umami-event="teaming-capability-statement"
              className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:text-steel"
            >
              Full Capability Statement
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
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
