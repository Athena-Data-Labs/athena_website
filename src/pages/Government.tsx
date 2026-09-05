import { ArrowUpRight, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import { capability, certifications, entity, SBA_VERIFY_URL } from "@/content";
import { CTA_PRIMARY } from "@/lib/cta";

/**
 * The capability statement.
 *
 * Contracting officers and prime capture managers ask for this artifact by
 * name, and the convention is a one-page PDF — which means almost every one in
 * circulation is out of date. This is the same document as a page that cannot
 * go stale, because every identifier on it is read from the SAM.gov
 * registration through src/content/capability.ts rather than retyped here.
 *
 * The order is the order it gets read in: who you are and how to file us,
 * what we do, why us, the codes, what we have built, who to call. Deviating
 * from that only slows down the person scanning it.
 *
 * It also prints. A print stylesheet is a far better answer than generating a
 * PDF at build time: the reader gets the current version at the moment they
 * press Cmd-P, and there is no second artifact to keep in sync.
 */

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="border-t border-foreground/[0.07] py-10 first:border-t-0 first:pt-0 md:py-12">
    <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-meta">
      <span className="h-3 w-[2px] shrink-0 bg-steel print:hidden" />
      {eyebrow}
    </span>
    <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
      {title}
    </h2>
    <div className="mt-6">{children}</div>
  </section>
);

const identifiers = [
  { label: "Legal name", value: entity.legalName },
  { label: "DBA", value: entity.dba },
  { label: "UEI", value: entity.uei, mono: true },
  { label: "CAGE", value: entity.cage, mono: true },
  { label: "Certifications", value: certifications.map((c) => c.abbr).join(" · ") },
  { label: "SAM.gov", value: `${entity.sam.status} · ${entity.sam.purpose}` },
  { label: "Primary NAICS", value: entity.naics.find((n) => n.primary)?.code ?? "", mono: true },
  { label: "Location", value: `${entity.location.city}, ${entity.location.state} · ${entity.location.congressionalDistrict}` },
];

const Government = () => (
  <PageShell
    greek={{ word: "λειτουργία", roman: "leitourgia", gloss: "public service" }}
    eyebrow="Capability Statement"
    title={
      <>
        Athena Analytics <span className="text-gradient">L.L.C.</span>
      </>
    }
    intro="An SBA-certified Service-Disabled Veteran-Owned Small Business building decision intelligence systems. Everything a contracting officer or prime needs to evaluate and file us is on this page, read from our SAM.gov registration rather than retyped."
  >
    <Seo
      title="SDVOSB Capability Statement"
      description="Capability statement for Athena Analytics L.L.C., an SBA-certified SDVOSB and VOSB. UEI X1U1K5TYHVU5, CAGE 23SR2, primary NAICS 541512."
      path="/government"
      image="/og/government.png"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: entity.dba,
        legalName: entity.legalName,
        url: "https://athenadatalabs.com/government",
        email: entity.email,
        naics: entity.naics.find((n) => n.primary)?.code,
        identifier: [
          { "@type": "PropertyValue", name: "UEI", value: entity.uei },
          { "@type": "PropertyValue", name: "CAGE", value: entity.cage },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: entity.location.city,
          addressRegion: entity.location.state,
          addressCountry: "US",
        },
      }}
    />

    <div className="container mx-auto px-6">
        {/* ---------------------------------------------------- identifiers -- */}
        <Section eyebrow="At a Glance" title="Company Data">
          <dl className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {identifiers.map((row) => (
              <div key={row.label} className="bg-background px-5 py-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-meta">
                  {row.label}
                </dt>
                <dd className={`mt-1.5 text-sm text-foreground ${row.mono ? "font-mono tracking-[0.08em]" : ""}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              data-umami-event="print-capability-statement"
              className={CTA_PRIMARY}
            >
              <Printer size={14} />
              Save as PDF
            </button>
            <a
              href={SBA_VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="verify-sba-certification"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:text-steel"
            >
              Verify in SBA&rsquo;s certification register
              <ArrowUpRight size={13} />
            </a>
          </div>
        </Section>

        {/* --------------------------------------------------- competencies -- */}
        <Section eyebrow="What We Do" title="Core Competencies">
          <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {capability.competencies.map((c) => (
              <div key={c.title} className="bg-background p-6">
                <h3 className="font-display text-base font-semibold leading-snug tracking-tight text-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{c.detail}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ------------------------------------------------- differentiators -- */}
        <Section eyebrow="Why Us" title="Differentiators">
          <ul className="space-y-6">
            {capability.differentiators.map((d) => (
              <li key={d.title} className="border-l-2 border-steel/40 pl-5">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground md:text-lg">
                  {d.title}
                </h3>
                <p className="mt-1.5 max-w-3xl text-sm leading-[1.7] text-muted-foreground">{d.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* ---------------------------------------------------------- codes -- */}
        <Section eyebrow="How to Find Us" title="NAICS &amp; PSC Codes">
          <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-2">
            {[
              { title: "NAICS Codes", codes: entity.naics },
              { title: "PSC Codes", codes: entity.psc },
            ].map(({ title, codes }) => (
              <div key={title} className="bg-background p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-meta">
                  {title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {codes.map((c) => (
                    <li key={c.code + c.label} className="flex gap-3 text-sm leading-[1.5]">
                      <span className="w-[3.6rem] shrink-0 font-mono text-foreground">{c.code}</span>
                      <span className="text-muted-foreground">
                        {c.label}
                        {"primary" in c && c.primary && (
                          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                            Primary
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* ----------------------------------------------------- experience -- */}
        {/* Headed "Relevant Experience", never "Past Performance": that phrase
            means federal contracts performed, and ours is commercial. */}
        <Section eyebrow="What We Have Built" title="Relevant Experience">
          <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06]">
            {capability.experience.map((e) => (
              <article key={e.name} className="bg-background p-6 md:p-7">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    {e.name}
                  </h3>
                  {e.priorToCompany && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                      Founder, prior to Athena
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-meta">
                  {e.role}
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-[1.7] text-muted-foreground">{e.body}</p>
                {e.to && (
                  <Link
                    to={e.to}
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-meta transition-colors hover:text-steel print:hidden"
                  >
                    Details
                    <ArrowUpRight size={12} />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </Section>

        {/* ----------------------------------------------------------- poc -- */}
        <Section eyebrow="Who to Call" title="Point of Contact">
          <div className="border border-foreground/[0.07] bg-background p-6 md:p-7">
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              {entity.poc.name}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-meta">
              {entity.poc.title}
            </p>
            <a
              href={`mailto:${entity.poc.email}?subject=${encodeURIComponent("Capability statement / teaming inquiry")}`}
              data-umami-event="capability-contact"
              className="mt-4 inline-block text-sm text-steel transition-colors hover:text-foreground"
            >
              {entity.poc.email}
            </a>
            <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-muted-foreground">
              We bid as a prime and we team as a subcontractor. If you are building a team against
              a live notice, send the solicitation number and the response date and you will get an
              answer from the person who would do the work.
            </p>
          </div>
      </Section>
    </div>
  </PageShell>
);

export default Government;
