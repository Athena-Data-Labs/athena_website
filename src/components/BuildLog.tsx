import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { milestones } from "@/content";
import { DUR, EASE } from "@/lib/motion";

/**
 * The company's build log, newest last so it reads as a march forward.
 *
 * A small studio's hardest unspoken objection is "is anyone still working on
 * this?" Dated, checkable milestones answer it without anyone having to ask —
 * and because the list is content, a stale one is visible rather than silent.
 */
const BuildLog = () => (
  <div className="relative">
    {/* The rail sits above the entries, which are opaque, and the markers above
        the rail, so each reads as a node on the line. */}
    <div className="absolute bottom-6 left-[5px] top-6 z-10 hidden w-px bg-gradient-to-b from-transparent via-steel/25 to-steel/50 md:block" />

    <ol className="border-t border-foreground/[0.07]">
      {milestones.map((m, i) => {
        const to = m.productSlug
          ? `/products/${m.productSlug}`
          : m.fieldNoteSlug
            ? `/resources/field-notes/${m.fieldNoteSlug}`
            : undefined;

        return (
          <motion.li
            key={m.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: DUR.reveal, delay: Math.min(i * 0.05, 0.3), ease: EASE }}
            className="group relative bg-background md:pl-10"
          >
            <span
              className={`absolute left-0 top-[26px] z-20 hidden h-[11px] w-[11px] border transition-colors duration-200 md:block ${
                m.current
                  ? "border-primary bg-primary"
                  : "border-steel/60 bg-background group-hover:bg-steel"
              }`}
            />
            <div className="border-b border-foreground/[0.07] py-6 transition-colors duration-200 group-hover:bg-foreground/[0.02] md:pl-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                {m.period}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
                {m.title}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-[1.7] text-muted-foreground">
                {m.description}
              </p>
              {to && (
                <Link
                  to={to}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45 transition-colors hover:text-steel"
                >
                  {m.fieldNoteSlug ? "Read the write-up" : "See the product"}
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </motion.li>
        );
      })}
    </ol>
  </div>
);

export default BuildLog;
