import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import { caseStudies, fieldNotes } from "@/content";
import { byDateDesc, formatMonthYear } from "@/lib/utils";

const collections = [
  {
    to: "/resources/case-studies",
    icon: FileText,
    title: "Case Studies",
    description:
      "The products we've shipped, end to end: who they're for, what we built, and what changed as a result. Written for anyone deciding whether to work with us.",
    count: `${caseStudies.length} published`,
  },
  {
    to: "/resources/field-notes",
    icon: BookOpen,
    title: "Field Notes",
    description:
      "Engineering write-ups from our own production systems: architecture, migrations, and post-mortems. Written for the person who has to implement it.",
    count: `${fieldNotes.length} published`,
  },
];

// Newest three publications across both collections, by publish date.
const latest: LinkCardItem[] = byDateDesc([
  ...caseStudies.map((c) => ({
    date: c.date,
    to: `/resources/case-studies/${c.slug}`,
    tag: "Case Study",
    title: c.title,
    description: c.summary,
    meta: `${c.readingTimeMinutes} min read · ${formatMonthYear(c.date)}`,
  })),
  ...fieldNotes.map((a) => ({
    date: a.date,
    to: `/resources/field-notes/${a.slug}`,
    tag: "Field Note",
    title: a.title,
    description: a.summary,
    meta: `${a.readingTimeMinutes} min read · ${formatMonthYear(a.date)}`,
  })),
])
  .slice(0, 3)
  .map(({ date: _date, ...item }) => item);

const ResourcesIndex = () => {
  return (
    <PageShell
      greek={{ word: "ἱστορία", roman: "historia", gloss: "inquiry" }}
      eyebrow="Resources"
      title={
        <>
          Everything We&apos;ve <span className="text-gradient">Written Down</span>
        </>
      }
      intro="Two kinds of writing. Case studies are the outcome: what we built and what it changed. Field notes are the method: the architecture, the trade-offs, and the mistakes, in full."
    >
      <Seo
        title="Resources: Case Studies & Field Notes"
        description="Case studies and engineering field notes from Athena Data Labs: AWS account architecture, privacy-first backends, BI dashboard design, forecasting, AI agents, and React SPA SEO."
        path="/resources"
        image="/og/resources.png"
        bare
      />

      <section className="border-b border-white/[0.06] panel py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-2">
            {collections.map((col, i) => (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full"
              >
                <Link
                  to={col.to}
                  data-umami-event={`resources-${col.to.split("/").pop()}`}
                  className="group flex h-full flex-col bg-[#0a0c10] p-8 transition-colors hover:bg-white/[0.02]"
                >
                  <col.icon size={22} className="text-steel" />
                  <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">{col.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-[1.65] text-muted-foreground">{col.description}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{col.count}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors group-hover:text-steel">
                    Browse <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-steel" />
              Latest
            </span>
            <div className="mt-5">
              <LinkCards items={latest} ctaLabel="Read" />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default ResourcesIndex;
