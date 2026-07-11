import { Navigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import { getService, getProduct, getCaseStudy, getInsight } from "@/content";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getService(slug) : undefined;

  if (!service) return <Navigate to="/services" replace />;

  const related: LinkCardItem[] = [
    ...service.relatedProductSlugs.flatMap((s) => {
      const p = getProduct(s);
      return p
        ? [{ to: `/products/${p.slug}`, tag: "Product", title: p.name, description: p.summary, meta: p.tag }]
        : [];
    }),
    ...service.relatedCaseStudySlugs.flatMap((s) => {
      const c = getCaseStudy(s);
      return c
        ? [{ to: `/resources/case-studies/${c.slug}`, tag: "Case Study", title: c.title, description: c.summary, meta: `${c.readingTimeMinutes} min read` }]
        : [];
    }),
    ...service.relatedInsightSlugs.flatMap((s) => {
      const a = getInsight(s);
      return a
        ? [{ to: `/resources/insights/${a.slug}`, tag: "Insight", title: a.title, description: a.summary, meta: `${a.readingTimeMinutes} min read` }]
        : [];
    }),
  ];

  return (
    <PageShell
      eyebrow="Services"
      title={
        <>
          {service.name}
          <span className="mt-3 block text-xl font-semibold tracking-tight text-muted-foreground sm:text-2xl">
            {service.headline}
          </span>
        </>
      }
      intro={service.summary}
      breadcrumb={{ label: "All Services", to: "/services" }}
    >
      <Seo
        title={`${service.name} Services`}
        description={service.summary}
        path={`/services/${service.slug}`}
        image={`/og/services/${service.slug}.png`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.summary,
          provider: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
        }}
      />

      <SectionBlock eyebrow="Overview">
        <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="border border-white/[0.08] bg-[hsl(213,38%,9%)] px-8 py-9 lg:px-10">
            {service.overview.map((p, i) => (
              <p key={i} className={`text-base leading-[1.8] text-muted-foreground ${i > 0 ? "mt-4" : ""}`}>
                {p}
              </p>
            ))}
          </div>
          <div className="flex flex-col border border-t-0 border-white/[0.08] bg-[hsl(213,42%,6%)] lg:border-l-0 lg:border-t">
            <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Problems // Solved</p>
            </div>
            {service.problems.map((problem) => (
              <div key={problem} className="flex gap-3 border-b border-white/[0.04] px-6 py-4 last:border-b-0">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary/60" />
                <p className="text-sm leading-[1.6] text-muted-foreground">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="What You Get" tone="panel">
        <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-3">
          {service.benefits.map((benefit) => (
            <div key={benefit.title} className="bg-[#0a0c10] p-7">
              <h3 className="font-display text-base font-semibold tracking-tight text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Technologies
          </span>
          {service.technologies.map((tech) => (
            <span
              key={tech}
              className="border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </SectionBlock>

      {related.length > 0 && (
        <SectionBlock eyebrow="Proof of Delivery" title="Related Work">
          <LinkCards items={related} ctaLabel="View" />
        </SectionBlock>
      )}

      <ConsultationCta />
    </PageShell>
  );
};

export default ServiceDetail;
