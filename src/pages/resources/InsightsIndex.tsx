import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import LinkCards from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import { insights } from "@/content";

const InsightsIndex = () => {
  const items = insights.map((a) => ({
    to: `/resources/insights/${a.slug}`,
    tag: a.categories.join(" · "),
    title: a.title,
    description: a.summary,
    meta: `${a.readingTimeMinutes} min read`,
  }));

  return (
    <PageShell
      eyebrow="Insights"
      title={
        <>
          Technical Notes, <span className="text-gradient">Field-Tested</span>
        </>
      }
      intro="Practical articles on business intelligence, forecasting, AI agents, and web engineering. Patterns we use in production, written for people who ship."
      breadcrumb={{ label: "Resources", to: "/resources" }}
    >
      <Seo
        title="Insights — Technical Articles"
        description="Technical articles from Athena Data Labs on dashboard design, practical forecasting, AI agents with human-in-the-loop control, and SEO for React SPAs."
        path="/resources/insights"
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <LinkCards items={items} ctaLabel="Read Article" columns={2} />
        </div>
      </section>

      <ConsultationCta />
    </PageShell>
  );
};

export default InsightsIndex;
