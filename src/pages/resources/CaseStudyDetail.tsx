import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ContentBody from "@/components/page/ContentBody";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import { getCaseStudy, getProduct, getService, getInsight } from "@/content";

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const study = slug ? getCaseStudy(slug) : undefined;

  if (!study) return <Navigate to="/resources/case-studies" replace />;

  const product = study.productSlug ? getProduct(study.productSlug) : undefined;
  const services = study.serviceSlugs.map(getService).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const related: LinkCardItem[] = [
    ...(product
      ? [{ to: `/products/${product.slug}`, tag: "Product", title: product.name, description: product.summary, meta: product.tag }]
      : []),
    ...study.relatedInsightSlugs.flatMap((s) => {
      const a = getInsight(s);
      return a
        ? [{ to: `/resources/insights/${a.slug}`, tag: "Insight", title: a.title, description: a.summary, meta: `${a.readingTimeMinutes} min read` }]
        : [];
    }),
  ];

  return (
    <PageShell
      eyebrow="Case Study"
      title={study.title}
      titleSize="compact"
      intro={study.summary}
      breadcrumb={{ label: "All Case Studies", to: "/resources/case-studies" }}
      headerExtra={
        <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
          <span>{study.readingTimeMinutes} min read</span>
          <span className="h-3 w-px bg-white/15" />
          <span>{new Date(study.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
          {product && (
            <>
              <span className="h-3 w-px bg-white/15" />
              <Link to={`/products/${product.slug}`} className="text-primary/80 transition-colors hover:text-primary">
                Product: {product.name}
              </Link>
            </>
          )}
        </p>
      }
    >
      <Seo
        title={study.title}
        description={study.summary}
        path={`/resources/case-studies/${study.slug}`}
        image={`/og/case-studies/${study.slug}.png`}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: study.title,
          description: study.summary,
          datePublished: study.date,
          author: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
        }}
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            {study.overview.map((p, i) => (
              <p key={i} className="text-lg leading-[1.8] text-slate-100/90">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-10">
            <ContentBody sections={study.sections} />
          </div>

          {services.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-white/[0.06] pt-8">
              <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Related Services
              </span>
              {services.map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <SectionBlock eyebrow="Keep Exploring" title="Related" tone="panel">
          <LinkCards items={related} ctaLabel="View" />
        </SectionBlock>
      )}

      <ConsultationCta />
    </PageShell>
  );
};

export default CaseStudyDetail;
