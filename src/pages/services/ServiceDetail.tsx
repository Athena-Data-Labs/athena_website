import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import { getService, getProduct, getCaseStudy, getFieldNote } from "@/content";

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
    ...service.relatedFieldNoteSlugs.flatMap((s) => {
      const a = getFieldNote(s);
      return a
        ? [{ to: `/resources/field-notes/${a.slug}`, tag: "Field Note", title: a.title, description: a.summary, meta: `${a.readingTimeMinutes} min read` }]
        : [];
    }),
  ];

  return (
    <PageShell
      eyebrow="Services"
      /* The h1 here is two parts — the service, then its headline underneath —
         and the toolbar reads an h1 by `textContent`, which runs them together
         with nothing between: every service page condensed to "Data
         AnalyticsStop debating the numbers. Start using them.", truncated
         mid-sentence. The bar wants the name of the page, which is the first
         half. */
      toolbarTitle={service.name}
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
          <div className="border border-foreground/[0.08] bg-surface px-8 py-9 lg:px-10">
            {service.overview.map((p, i) => (
              <p key={i} className={`text-base leading-[1.8] text-muted-foreground ${i > 0 ? "mt-4" : ""}`}>
                {p}
              </p>
            ))}
          </div>
          <div className="flex flex-col border border-t-0 border-foreground/[0.08] bg-surface-sunken lg:border-l-0 lg:border-t">
            <div className="border-b border-foreground/[0.06] bg-foreground/[0.02] px-6 py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/55">Problems // Solved</p>
            </div>
            {service.problems.map((problem) => (
              <div key={problem} className="flex gap-3 border-b border-foreground/[0.04] px-6 py-4 last:border-b-0">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-steel/60" />
                <p className="text-sm leading-[1.6] text-muted-foreground">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Proof before promises: the discipline has already produced something,
          and the reader can go and look at it. */}
      <SectionBlock eyebrow="Already Built" title="A Worked Example" tone="panel">
        <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.05] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="bg-background p-8 md:p-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel/80">
              {service.workedExample.label}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-[1.8] text-muted-foreground">
              {service.workedExample.body}
            </p>
            {service.workedExample.to && (
              <Link
                to={service.workedExample.to}
                className="group mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-steel/85 transition-colors hover:text-steel"
              >
                Go and look
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
          <div className="bg-background p-8 md:p-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              Typical Engagement
            </p>
            <p className="mt-4 text-sm leading-[1.75] text-muted-foreground">{service.engagement}</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock eyebrow="What You Get" tone="panel">
        <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.05] md:grid-cols-3">
          {service.benefits.map((benefit) => (
            <div key={benefit.title} className="bg-background p-7">
              <h3 className="font-display text-base font-semibold tracking-tight text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            Technologies
          </span>
          {service.technologies.map((tech) => (
            <span
              key={tech}
              className="border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-1 text-xs text-muted-foreground"
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
