import Seo from "@/components/Seo";
import PageShell from "@/components/page/PageShell";
import LinkCards from "@/components/page/LinkCards";
import ConsultationCta from "@/components/ConsultationCta";
import { caseStudies, getProduct } from "@/content";

const CaseStudiesIndex = () => {
  const items = caseStudies.map((c) => {
    const product = c.productSlug ? getProduct(c.productSlug) : undefined;
    return {
      to: `/resources/case-studies/${c.slug}`,
      tag: product ? `Case Study · ${product.name}` : "Case Study",
      title: c.title,
      description: c.summary,
      meta: `${c.readingTimeMinutes} min read`,
    };
  });

  return (
    <PageShell
      eyebrow="Case Studies"
      title={
        <>
          Shipped, in Production, <span className="text-gradient">Documented</span>
        </>
      }
      intro="How our products were designed, built, and shipped: the problem, the architecture, the results, and the lessons. No invented clients, no inflated numbers."
      breadcrumb={{ label: "Resources", to: "/resources" }}
    >
      <Seo
        title="Case Studies"
        description="Case studies from Athena Data Labs: building Aegis BI, shipping MyBudgetNerd to the App Store, and making neural networks hands-on with ANN Builder Studio."
        path="/resources/case-studies"
        image="/og/case-studies.png"
      />

      <section className="border-b border-white/[0.06] bg-[#0a0c10] py-12 md:py-16">
        <div className="container mx-auto px-6">
          <LinkCards items={items} ctaLabel="Read Case Study" />
        </div>
      </section>

      <ConsultationCta />
    </PageShell>
  );
};

export default CaseStudiesIndex;
