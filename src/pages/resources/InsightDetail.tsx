import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ContentBody from "@/components/page/ContentBody";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import { getInsight, getProduct, getService } from "@/content";

const InsightDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getInsight(slug) : undefined;

  if (!article) return <Navigate to="/resources/insights" replace />;

  const services = article.relatedServiceSlugs.map(getService).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const related: LinkCardItem[] = [
    ...article.relatedInsightSlugs.flatMap((s) => {
      const a = getInsight(s);
      return a
        ? [{ to: `/resources/insights/${a.slug}`, tag: "Insight", title: a.title, description: a.summary, meta: `${a.readingTimeMinutes} min read` }]
        : [];
    }),
    ...article.relatedProductSlugs.flatMap((s) => {
      const p = getProduct(s);
      return p
        ? [{ to: `/products/${p.slug}`, tag: "Product", title: p.name, description: p.summary, meta: p.tag }]
        : [];
    }),
  ];

  return (
    <PageShell
      eyebrow={article.categories.join(" · ")}
      title={article.title}
      titleSize="compact"
      intro={article.summary}
      breadcrumb={{ label: "All Insights", to: "/resources/insights" }}
      headerExtra={
        <div className="mt-5">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
            <span>{article.readingTimeMinutes} min read</span>
            <span className="h-3 w-px bg-white/15" />
            <span>{new Date(article.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
          </p>
          <p className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </p>
        </div>
      }
    >
      <Seo
        title={article.title}
        description={article.summary}
        path={`/resources/insights/${article.slug}`}
        image={`/og/insights/${article.slug}.png`}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.summary,
          datePublished: article.date,
          dateModified: article.date,
          image: `https://athenadatalabs.com/og/insights/${article.slug}.png`,
          mainEntityOfPage: `https://athenadatalabs.com/resources/insights/${article.slug}`,
          articleSection: "Insight",
          keywords: article.tags.join(", "),
          author: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
          publisher: {
            "@type": "Organization",
            name: "Athena Data Labs",
            url: "https://athenadatalabs.com",
            logo: { "@type": "ImageObject", url: "https://athenadatalabs.com/favicon.png" },
          },
        }}
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <ContentBody sections={article.sections} />

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

export default InsightDetail;
