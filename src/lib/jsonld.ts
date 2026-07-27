/**
 * Shared structured-data builders.
 *
 * A page carries one managed JSON-LD script (see `Seo`), so anything with more
 * than one entity emits an `@graph`. Breadcrumbs and FAQs are the two that earn
 * their weight here: both can produce rich results, and both were being left on
 * the table on pages that already had the content for them.
 */

const ORIGIN = "https://athenadatalabs.com";

type Crumb = { name: string; path: string };

/** BreadcrumbList for a detail page. Pass the trail without the page itself. */
export const breadcrumbList = (trail: Crumb[], current: string) => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    ...trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${ORIGIN}${crumb.path}`,
    })),
    { "@type": "ListItem", position: trail.length + 1, name: current },
  ],
});

/** FAQPage from a product's own question list. */
export const faqPage = (faq: { question: string; answer: string }[]) => ({
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

/** Offer for a subscription product. Monthly is the headline price. */
export const subscriptionOffer = (monthly: number) => ({
  "@type": "Offer",
  price: monthly.toFixed(2),
  priceCurrency: "USD",
  availability: "https://schema.org/InStock",
  url: ORIGIN,
});

export const JSONLD_ORIGIN = ORIGIN;
