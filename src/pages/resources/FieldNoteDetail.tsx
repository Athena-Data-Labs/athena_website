import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import ContentBody from "@/components/page/ContentBody";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import SubscribeCard from "@/components/SubscribeCard";
import ConsultationCta from "@/components/ConsultationCta";
import { breadcrumbList } from "@/lib/jsonld";
import { getFieldNote, getProduct, getService } from "@/content";
import { resolveFieldNoteSlug } from "@/lib/redirects";

const FieldNoteDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getFieldNote(resolveFieldNoteSlug(slug)) : undefined;

  if (!article) return <Navigate to="/resources/field-notes" replace />;
  // A merged note keeps its own URL canonical, so bounce the alias rather than
  // serving the same article from two addresses.
  if (slug !== article.slug) return <Navigate to={`/resources/field-notes/${article.slug}`} replace />;

  const services = article.relatedServiceSlugs.map(getService).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const related: LinkCardItem[] = [
    ...article.relatedFieldNoteSlugs.flatMap((s) => {
      const a = getFieldNote(s);
      return a
        ? [{ to: `/resources/field-notes/${a.slug}`, tag: "Field Note", title: a.title, description: a.summary, meta: `${a.readingTimeMinutes} min read` }]
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
      toolbarTitle={article.seoTitle}
      eyebrow={article.categories.join(" · ")}
      title={article.title}
      titleSize="compact"
      intro={article.summary}
      breadcrumb={{ label: "All Field Notes", to: "/resources/field-notes" }}
      headerExtra={
        <div className="mt-5">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
            <span>{article.readingTimeMinutes} min read</span>
            <span className="h-3 w-px bg-foreground/15" />
            <span>{new Date(article.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long" })}</span>
          </p>
          <p className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="border border-foreground/[0.08] bg-foreground/[0.02] px-2.5 py-1 text-[11px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </p>
        </div>
      }
    >
      <Seo
        title={article.seoTitle ?? article.title}
        description={article.seoDescription ?? article.summary}
        path={`/resources/field-notes/${article.slug}`}
        image={`/og/field-notes/${article.slug}.png`}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.summary,
          datePublished: article.date,
          dateModified: article.date,
          image: `https://athenadatalabs.com/og/field-notes/${article.slug}.png`,
          mainEntityOfPage: `https://athenadatalabs.com/resources/field-notes/${article.slug}`,
          articleSection: "Field Note",
          breadcrumb: breadcrumbList(
            [
              { name: "Resources", path: "/resources" },
              { name: "Field Notes", path: "/resources/field-notes" },
            ],
            article.title,
          ),
          keywords: (article.keywords ?? article.tags).join(", "),
          author: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
          publisher: {
            "@type": "Organization",
            name: "Athena Data Labs",
            url: "https://athenadatalabs.com",
            logo: { "@type": "ImageObject", url: "https://athenadatalabs.com/favicon.png" },
          },
        }}
      />

      <section className="border-b border-foreground/[0.06] panel py-12 md:py-16">
        <div className="container mx-auto px-6">
          {article.overview && (
            <div className="max-w-3xl space-y-5">
              {article.overview.map((p, i) => (
                <p key={i} className="text-lg leading-[1.8] text-foreground/85">
                  {p}
                </p>
              ))}
            </div>
          )}
          <div className={article.overview ? "mt-10" : undefined}>
            <ContentBody sections={article.sections} />
          </div>

          {services.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-foreground/[0.06] pt-8">
              <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                Related Services
              </span>
              {services.map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-steel/40 hover:text-steel"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}

          {/* The highest-intent moment on the site: someone just read 2,000
              words of ours voluntarily. Ask for the small thing here. */}
          <div className="mt-12">
            <SubscribeCard
              eyebrow="Before You Go"
              heading="Get the next field note"
              description="One email when we publish, covering what we built, what it cost, and what went wrong."
              note="We use your address for this list only. Unsubscribe in one click."
              subject="Field Notes subscription"
              umamiEvent="subscribe-field-notes"
            />
          </div>
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

export default FieldNoteDetail;
