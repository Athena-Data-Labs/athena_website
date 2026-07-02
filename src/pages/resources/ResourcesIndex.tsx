import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, FileText, GraduationCap } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import { caseStudies, insights } from "@/content";

const collections = [
  {
    to: "/resources/case-studies",
    icon: FileText,
    title: "Case Studies",
    description:
      "Deep dives into the products we've shipped: the problem, the architecture, the results, and what we learned building them.",
    count: `${caseStudies.length} published`,
  },
  {
    to: "/resources/insights",
    icon: BookOpen,
    title: "Insights",
    description:
      "Technical articles on business intelligence, forecasting, AI agents, and data engineering. Practical patterns from production work.",
    count: `${insights.length} published`,
  },
  {
    to: "",
    icon: GraduationCap,
    title: "Guides",
    description:
      "Downloadable playbooks and white papers on the work we do. First guides publishing soon.",
    count: "Coming soon",
  },
];

const latest: LinkCardItem[] = [
  ...caseStudies.slice(0, 1).map((c) => ({
    to: `/resources/case-studies/${c.slug}`,
    tag: "Case Study",
    title: c.title,
    description: c.summary,
    meta: `${c.readingTimeMinutes} min read`,
  })),
  ...insights.slice(0, 2).map((a) => ({
    to: `/resources/insights/${a.slug}`,
    tag: "Insight",
    title: a.title,
    description: a.summary,
    meta: `${a.readingTimeMinutes} min read · ${a.categories[0]}`,
  })),
];

const ResourcesIndex = () => {
  return (
    <PageShell
      eyebrow="Resources"
      title={
        <>
          Field Notes from <span className="text-gradient">Production</span>
        </>
      }
      intro="Case studies, technical articles, and guides: everything we've learned designing, building, and shipping intelligence products, written down."
    >
      <Seo
        title="Resources — Case Studies, Insights & Guides"
        description="Case studies and technical articles from Athena Data Labs: BI dashboard design, forecasting, AI agents, React SEO, and lessons from shipping production data products."
        path="/resources"
        bare
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-3">
            {collections.map((col, i) => {
              const inner = (
                <>
                  <col.icon size={22} className="text-primary" />
                  <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">{col.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-[1.65] text-muted-foreground">{col.description}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{col.count}</p>
                  {col.to && (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors group-hover:text-primary">
                      Browse <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  )}
                </>
              );
              return (
                <motion.div
                  key={col.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-full"
                >
                  {col.to ? (
                    <Link to={col.to} className="group flex h-full flex-col bg-[#0a0c10] p-8 transition-colors hover:bg-white/[0.02]">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col bg-[#0a0c10] p-8 opacity-70">{inner}</div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
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
