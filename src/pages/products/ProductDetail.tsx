import { useEffect, useMemo, type ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import AtmosphereField from "@/components/hero/AtmosphereField";
import SectionBlock from "@/components/page/SectionBlock";
import LinkCards, { type LinkCardItem } from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import ProductHero from "@/components/product/ProductHero";
import ProductNav, { type NavItem } from "@/components/product/ProductNav";
import ProductPricing from "@/components/product/ProductPricing";
import AegisShowcase from "@/components/showcase/AegisShowcase";
import AnnShowcase from "@/components/showcase/AnnShowcase";
import MbnShowcase from "@/components/showcase/MbnShowcase";
import TheraShowcase from "@/components/showcase/TheraShowcase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProduct, getService, getCaseStudy, getFieldNote, productRating } from "@/content";
import { aggregateRating, breadcrumbList, faqPage, subscriptionOffer } from "@/lib/jsonld";

/** Each product's bespoke demo, shown directly under the hero. */
const showcases: Record<string, ComponentType> = {
  aegis: AegisShowcase,
  mybudgetnerd: MbnShowcase,
  thera: TheraShowcase,
  "ann-studio": AnnShowcase,
};

/** The hero and the closing CTA are the two windows onto the fixed backdrop. */
const FIELD_WINDOWS = ["#product-hero", "#consultation-cta"];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Built before the early return so the hook order never changes between products.
  const navItems = useMemo<NavItem[]>(() => {
    if (!product) return [];
    return [
      { id: "overview", label: "Overview" },
      { id: "why", label: "Why It Exists" },
      ...(product.provenance ? [{ id: "origin", label: "Origin" }] : []),
      { id: "capabilities", label: "Capabilities" },
      { id: "pricing", label: "Pricing" },
      ...(product.faq.length ? [{ id: "faq", label: "FAQ" }] : []),
    ];
  }, [product]);

  if (!product) return <Navigate to="/products" replace />;

  const Showcase = showcases[product.slug];

  // Ratings of this product only — never the studio's own client reviews.
  const rating = productRating(product.slug);

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

  const [lede, ...rest] = product.problem;

  return (
    <div className="min-h-screen bg-background">
      <AtmosphereField
        watch={FIELD_WINDOWS}
        intensity={0.5}
        guard="even"
        scrollMode="document"
        revealOn="mount"
      />
      <Seo
        title={product.seoTitle ?? `${product.name}: ${product.tagline}`}
        description={product.seoDescription ?? product.summary}
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
              operatingSystem: product.hosting.operatingSystem,
              ...(product.priceUsdMonthly ? { offers: subscriptionOffer(product.priceUsdMonthly) } : {}),
              /* Only for products people have actually rated. The rest emit no
                 aggregateRating at all rather than an empty or zeroed one, which
                 would be a claim that the product scored nothing. */
              ...(rating ? { aggregateRating: aggregateRating(rating.average, rating.count) } : {}),
              publisher: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
            },
            ...(product.faq.length ? [faqPage(product.faq)] : []),
            breadcrumbList([{ name: "Products", path: "/products" }], product.name),
          ],
        }}
      />

      {/* Positioned layer so page sections paint above the fixed backdrop;
          the transparent hero and ConsultationCta are the reveal windows. */}
      <div className="relative z-10">
        <ProductHero product={product} />
        <ProductNav items={navItems} />

        {/* What it is, then the thing itself. The prose lede was homeless after
            the hero took over naming and pitching; it belongs here, as the
            caption to the demo rather than a section competing with it. */}
        <section
          id="overview"
          className="scroll-mt-[7.5rem] border-b border-foreground/[0.06] panel py-12 md:py-16"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-3xl">
              {product.overview.map((p, i) => (
                <p
                  key={i}
                  className={`text-base leading-[1.8] text-foreground/85 md:text-lg ${i > 0 ? "mt-5" : ""}`}
                >
                  {p}
                </p>
              ))}
            </div>

            {Showcase && (
              <div className="mt-12">
                <Showcase />
              </div>
            )}
          </div>
        </section>

        {/* The reason the product exists, set as a statement rather than a
            paragraph. It is the most persuasive copy on the page and it was
            being rendered at the same size as a feature caption. */}
        <section
          id="why"
          className="relative scroll-mt-[7.5rem] border-b border-foreground/[0.06] bg-background py-14 md:py-20"
        >
          <div className="container mx-auto px-6">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
              <span className="h-3 w-[2px] shrink-0 bg-steel" />
              Why It Exists
            </span>
            <p className="mt-7 max-w-4xl font-display text-2xl font-medium leading-[1.32] tracking-[-0.02em] text-foreground md:text-[2.1rem]">
              {lede}
            </p>
            {rest.length > 0 && (
              <div className="mt-8 max-w-2xl border-l-2 border-primary/50 pl-6 md:pl-8">
                {rest.map((p, i) => (
                  <p
                    key={i}
                    className={`text-base leading-[1.8] text-muted-foreground ${i > 0 ? "mt-4" : ""}`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Where the product came from, disclosures included. Set apart from the
            marketing sections on purpose: a reader should be able to tell at a
            glance that this paragraph is not selling to them. */}
        {product.provenance && (
          <SectionBlock id="origin" eyebrow={product.provenance.label} tone="panel">
            <div className="max-w-3xl border-l-2 border-steel/40 bg-foreground/[0.02] px-7 py-7 md:px-9">
              {product.provenance.paragraphs.map((p, i) => (
                <p key={i} className={`text-base leading-[1.8] text-muted-foreground ${i > 0 ? "mt-4" : ""}`}>
                  {p}
                </p>
              ))}
            </div>
          </SectionBlock>
        )}

        <SectionBlock id="capabilities" eyebrow="Capabilities" title="What It Does">
          <ol className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-2 lg:grid-cols-3">
            {product.features.map((feature, i) => (
              <li
                key={feature.title}
                className="group relative bg-background p-7 transition-colors duration-300 hover:bg-foreground/[0.025] md:p-8"
              >
                <span className="absolute right-6 top-7 font-mono text-[10px] tracking-[0.16em] text-foreground/15 transition-colors duration-300 group-hover:text-primary/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block h-px w-8 bg-steel/50 transition-all duration-300 group-hover:w-16 group-hover:bg-primary/80" />
                <h3 className="mt-6 max-w-[85%] font-display text-lg font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-[1.7] text-muted-foreground">
                  {feature.description}
                </p>
              </li>
            ))}
          </ol>
        </SectionBlock>

        <SectionBlock id="pricing" eyebrow="Pricing" title="Priced in the Open" tone="panel">
          <ProductPricing product={product} />
        </SectionBlock>

        {product.faq.length > 0 && (
          <SectionBlock id="faq" eyebrow="FAQ" title="Common Questions">
            <Accordion
              type="single"
              collapsible
              defaultValue="faq-0"
              className="max-w-3xl border border-foreground/[0.08] bg-surface"
            >
              {product.faq.map((item, i) => (
                <AccordionItem
                  key={item.question}
                  value={`faq-${i}`}
                  className="border-b border-foreground/[0.06] px-6 last:border-b-0 md:px-7"
                >
                  <AccordionTrigger className="gap-6 py-5 text-left font-display text-base font-semibold tracking-tight text-foreground hover:no-underline data-[state=open]:text-primary [&>svg]:text-foreground/40">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pr-8 text-sm leading-[1.75] text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SectionBlock>
        )}


        {(related.length > 0 || relatedServices.length > 0) && (
          <SectionBlock eyebrow="Go Deeper" title="Related Reading & Services">
            <LinkCards items={related} ctaLabel="Read" columns={2} />
            {relatedServices.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
                <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                  Related Services
                </span>
                {relatedServices.map((s) => (
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
          </SectionBlock>
        )}

        <ConsultationCta />
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
