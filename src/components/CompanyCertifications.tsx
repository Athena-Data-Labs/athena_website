import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { certifications, SBA_VERIFY_URL } from "@/content";

/**
 * The company's federal certifications, kept separate from the founder's
 * credentials above them.
 *
 * They are different claims and get muddled constantly: the degrees and the
 * decade of DoD analysis belong to a person, and SDVOSB status belongs to the
 * business. A prime looking for a certified subcontractor needs the second one,
 * and needs to be able to tell which is which at a glance.
 *
 * Every card carries the certifying body and the date, and the section links to
 * SBA's own register rather than asking anyone to take this page's word for it —
 * which is the only kind of proof that is worth anything on a claim a company
 * makes about itself.
 */
const CompanyCertifications = () => (
  <section id="certifications" className="relative py-12 md:py-20">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
          <span className="h-3 w-[2px] shrink-0 bg-steel" />
          The Company
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Federal Certifications
        </h2>
        <div className="mt-3 h-px w-16 bg-steel/40" />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Athena Analytics LLC is certified by the U.S. Small Business Administration and is
          eligible for set-aside contracts in both programs. We bid as a prime and we team as a
          subcontractor &mdash; the identifiers a prime needs are on the{" "}
          <Link to="/contact#federal" className="text-steel underline-offset-4 hover:underline">
            contact page
          </Link>
          .
        </p>

        <div className="mt-8 grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-2">
          {certifications.map((cert) => (
            <div key={cert.abbr} className="bg-background p-7">
              <BadgeCheck size={20} className="text-steel" />
              <p className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                {cert.abbr}
              </p>
              <p className="mt-1.5 text-sm leading-[1.6] text-muted-foreground">{cert.name}</p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/40">
                {cert.issuerShort} · Certified {cert.dateLabel}
              </p>
            </div>
          ))}
        </div>

        <a
          href={SBA_VERIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="verify-sba-certification"
          className="group mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60 transition-colors hover:text-steel"
        >
          Verify in SBA&rsquo;s certification search
          <ExternalLink size={13} />
        </a>
      </motion.div>
    </div>
  </section>
);

export default CompanyCertifications;
