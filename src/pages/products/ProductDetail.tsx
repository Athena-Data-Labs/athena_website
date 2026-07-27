import { useEffect, type ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import AtmosphereField from "@/components/hero/AtmosphereField";
import Footer from "@/components/Footer";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import SubscribeCard from "@/components/SubscribeCard";
import ConsultationCta from "@/components/ConsultationCta";
import AegisShowcase from "@/components/showcase/AegisShowcase";
import AnnShowcase from "@/components/showcase/AnnShowcase";
import TheraShowcase from "@/components/showcase/TheraShowcase";
import ProductSection from "@/components/ProductSection";
import { getProduct, getService, getCaseStudy, getFieldNote } from "@/content";
import { breadcrumbList, faqPage, subscriptionOffer } from "@/lib/jsonld";

/**
 * Each product keeps its bespoke marketing showcase as the page hero.
 * `contained: true` showcases are bare articles that need a section/container wrapper;
 * MyBudgetNerd's showcase is a self-contained full-bleed section.
 */
const showcases: Record<string, { Component: ComponentType; contained: boolean }> = {
  aegis: { Component: AegisShowcase, contained: true },
  mybudgetnerd: { Component: ProductSection, contained: false },
  thera: { Component: TheraShowcase, contained: true },
  "ann-studio": { Component: AnnShowcase, contained: true },
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) return <Navigate to="/products" replace />;

  const showcase = showcases[product.slug];

  const related: LinkCardItem[] = [
    ...product.relatedCaseStudySlugs.flatMap((s) => {
      const c = getCaseStudy(s);
      return c
        ? [{ to: `/resources/case-studies/${c.slug}`, tag: "Case Study", title: c.title, description: c.summary, meta: `${c.readingTimeMinutes} min read` }]
        : [];
    }),
    ...product.relatedFieldNoteSlugs.flatMap((s) => {
      const a = getFieldNote(s);
      return a
        ? [{ to: `/resources/field-notes/${a.slug}`, tag: "Field Note", title: a.title, description: a.summary, meta: `${a.readingTimeMinutes} min read` }]
        : [];
    }),
  ];

  const relatedServices = product.relatedServiceSlugs
    .map(getService)
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="min-h-screen bg-background">
      <AtmosphereField intensity={0.5} guard="even" scrollMode="document" revealOn="mount" />
      <Seo
        title={`${product.name}: ${product.tagline}`}
        description={product.summary}
        path={`/products/${product.slug}`}
        image={`/og/products/${product.slug}.png`}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "SoftwareApplication",
              name: product.name,
              description: product.summary,
              applicationCategory: "BusinessApplication",
              operatingSystem: product.slug === "mybudgetnerd" ? "iOS" : "Web",
              ...(product.priceUsdMonthly ? { offers: subscriptionOffer(product.priceUsdMonthly) } : {}),
              publisher: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
            },
            ...(product.faq.length ? [faqPage(product.faq)] : []),
            breadcrumbList([{ name: "Products", path: "/products" }], product.name),
          ],
        }}
      />
      <Navbar />

      {/* Positioned layer so page sections paint above the fixed backdrop;
          the transparent ConsultationCta at the bottom is the reveal window. */}
      <div className="relative z-10">

      {/* Slim breadcrumb strip — the showcase below is the page hero */}
      <div className="border-b border-white/[0.06] bg-[#0a0c10] pt-24 pb-4">
        <div className="container mx-auto px-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-steel"
          >
            <ArrowLeft size={14} /> All Products
          </Link>
        </div>
      </div>

      <div className="border-b border-white/[0.06] bg-[#0a0c10]">
        <div className="container mx-auto px-6">
          <dl className="grid grid-cols-2 gap-px bg-white/[0.06] md:grid-cols-4">
            {[
              { label: "Status", value: product.tag },
              { label: "Price", value: product.priceLabel ?? "On request" },
              { label: "Built with", value: product.technologies.slice(0, 2).join(" · ") },
              { label: "Runs on", value: "Docker on EC2" },
            ].map((spec) => (
              <div key={spec.label} className="bg-[#0a0c10] py-5 pr-6">
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                  {spec.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-snug text-foreground/90">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {showcase &&
        (showcase.contained ? (
          <section className="border-b border-white/[0.06] panel py-12 md:py-16">
            <div className="container mx-auto px-6">
              <showcase.Component />
            </div>
          </section>
        ) : (
          <showcase.Component />
        ))}

      <SectionBlock eyebrow="Why It Exists" tone="panel">
        <div className="max-w-3xl border-l-2 border-steel/40 pl-6 md:pl-8">
          {product.problem.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "font-display text-xl font-medium leading-[1.6] tracking-tight text-foreground md:text-2xl"
                  : "mt-5 text-base leading-[1.8] text-muted-foreground"
              }
            >
              {p}
            </p>
          ))}
        </div>
      </SectionBlock>

      {/* Where the product came from, disclosures included. Set apart from the
          marketing sections on purpose: a reader should be able to tell at a
          glance that this paragraph is not selling to them. */}
      {product.provenance && (
        <SectionBlock eyebrow={product.provenance.label}>
          <div className="max-w-3xl border-l-2 border-steel/40 bg-white/[0.02] px-7 py-7 md:px-9">
            {product.provenance.paragraphs.map((p, i) => (
              <p key={i} className={`text-base leading-[1.8] text-muted-foreground ${i > 0 ? "mt-4" : ""}`}>
                {p}
              </p>
            ))}
          </div>
        </SectionBlock>
      )}

      <SectionBlock eyebrow="Capabilities" title="Features">
        <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-2 lg:grid-cols-3">
          {product.features.map((feature) => (
            <div key={feature.title} className="bg-[#0a0c10] p-7">
              <h3 className="font-display text-base font-semibold tracking-tight text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Built With</span>
          {product.technologies.map((tech) => (
            <span key={tech} className="border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
        {product.pricing && (
          <p className="mt-6 border-l-2 border-steel/40 bg-white/[0.02] px-5 py-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Pricing: </span>
            {product.pricing}
          </p>
        )}
      </SectionBlock>

      {product.faq.length > 0 && (
        <SectionBlock eyebrow="FAQ" title="Common Questions" tone="panel">
          <div className="max-w-3xl divide-y divide-white/[0.06] border border-white/[0.08] bg-[hsl(213,38%,9%)]">
            {product.faq.map((item) => (
              <div key={item.question} className="px-7 py-6">
                <h3 className="font-display text-base font-semibold tracking-tight text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm leading-[1.7] text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* Pre-launch products used to send interested readers to a generic
          contact form, which is where intent goes to die. Capture it here. */}
      {product.comingSoon && (
        <div id="early-access" className="scroll-mt-20">
        <SectionBlock eyebrow="Early Access" tone="panel">
          <SubscribeCard
            eyebrow={`${product.name} Launch List`}
            heading={`Be told when ${product.name} opens up`}
            description={`${product.name} is in active development. Leave an address and we'll email you once when early access opens. Nothing else.`}
            note="One email at launch. No newsletter, and one click unsubscribes."
            subject={`${product.name} launch list`}
            umamiEvent={`launch-list-${product.slug}`}
            buttonLabel="Notify Me"
          />
        </SectionBlock>
        </div>
      )}

      {(related.length > 0 || relatedServices.length > 0) && (
        <SectionBlock eyebrow="Go Deeper" title="Related Reading & Services">
          <LinkCards items={related} ctaLabel="Read" columns={2} />
          {relatedServices.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
              <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Related Services
              </span>
              {relatedServices.map((s) => (
                <Link
                  key={s.slug}
                  to={`/services/${s.slug}`}
                  className="border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-steel/40 hover:text-steel"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </SectionBlock>
      )}

      <ConsultationCta />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
