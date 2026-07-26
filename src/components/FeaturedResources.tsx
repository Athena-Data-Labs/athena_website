import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import { caseStudies, fieldNotes } from "@/content";

/** Homepage band: one featured case study + one featured field note, linking into /resources. */
const FeaturedResources = () => {
  const featuredStudy = caseStudies[0];
  const featuredNote = fieldNotes[0];

  const items: LinkCardItem[] = [
    {
      to: `/resources/case-studies/${featuredStudy.slug}`,
      tag: "Featured Case Study",
      title: featuredStudy.title,
      description: featuredStudy.summary,
      meta: `${featuredStudy.readingTimeMinutes} min read`,
    },
    {
      to: `/resources/field-notes/${featuredNote.slug}`,
      tag: "Featured Field Note",
      title: featuredNote.title,
      description: featuredNote.summary,
      meta: `${featuredNote.readingTimeMinutes} min read · ${featuredNote.categories[0]}`,
    },
  ];

  return (
    <section className="relative border-b border-white/[0.06] py-12 md:py-20 panel">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-steel" />
              Resources
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              From the Field
            </h2>
            <div className="mt-3 h-px w-16 bg-steel/40" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              Case studies and technical articles: how we build, what we've shipped, and the
              patterns that survive production.
            </p>
          </div>
          <Link
            to="/resources"
            data-umami-event="home-all-resources"
            className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-steel/80 transition-colors hover:text-steel"
          >
            All Resources <ArrowRight size={14} />
          </Link>
        </motion.div>

        <LinkCards items={items} columns={2} ctaLabel="Read" />
      </div>
    </section>
  );
};

export default FeaturedResources;
