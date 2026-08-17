/**
 * Shared structured-data builders.
 *
 * A page carries one managed JSON-LD script (see `Seo`), so anything with more
 * than one entity emits an `@graph`. Breadcrumbs, FAQs and product ratings are
 * the three that earn their weight here: each can produce a rich result, and
 * each was being left on the table on pages that already had the content for it.
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

/**
 * AggregateRating for a product.
 *
 * The scale is stated rather than left to default, because a bare ratingValue of
 * 5 is ambiguous — out of five, or out of ten? — and the whole point of this
 * block is to say the thing a crawler would otherwise have to guess.
 *
 * Only ever attached to a specific product. A rating of the studio is not a
 * rating of any one thing the studio made, and rolling client reviews into an
 * app's score would inflate the app with praise that was never about it.
 */
export const aggregateRating = (value: number, count: number) => ({
  "@type": "AggregateRating",
  ratingValue: value.toFixed(1),
  ratingCount: count,
  bestRating: "5",
  worstRating: "1",
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
