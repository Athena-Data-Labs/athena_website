import { describe, expect, it } from "vitest";
import {
  appStoreReviews,
  peerPushRatings,
  productRating,
  products,
  ratings,
  reviewSummary,
  reviews,
  silentRatings,
  writtenReviews,
} from "@/content";
import { aggregateRating } from "@/lib/jsonld";

/**
 * The homepage rail shows one sentence of each review and claims it is the
 * reviewer's own wording. That claim is the only thing separating an excerpt from
 * a testimonial we wrote ourselves, and nothing about editing a string in a
 * content file would otherwise break if it stopped being true.
 */
describe("review excerpts", () => {
  for (const review of writtenReviews) {
    it(`${review.author}: excerpt is verbatim`, () => {
      expect(review.excerpt, "every written review needs a rail excerpt").toBeTruthy();
      expect(review.quote).toContain(review.excerpt);
    });
  }

  it("excerpts stay short enough to read going past", () => {
    for (const review of writtenReviews) {
      expect(review.excerpt!.length, `${review.author} excerpt is too long`).toBeLessThan(180);
    }
  });

  it("gives no excerpt to a rating with nothing written", () => {
    for (const rating of ratings.filter((r) => !r.quote)) {
      expect(rating.excerpt, `${rating.author} rated without writing anything`).toBeUndefined();
    }
  });
});

/** The section copy states these counts in prose, so they have to be derived. */
describe("review summary", () => {
  it("counts every rating exactly once", () => {
    expect(reviewSummary.ratingCount).toBe(
      reviews.length + appStoreReviews.length + peerPushRatings.length,
    );
    expect(reviewSummary.clientCount).toBe(reviews.length);
    expect(reviewSummary.appStoreCount).toBe(appStoreReviews.length);
    expect(reviewSummary.peerPushCount).toBe(peerPushRatings.length);
  });

  it("splits written reviews from silent ratings without losing any", () => {
    expect(reviewSummary.writtenCount).toBe(writtenReviews.length);
    expect(reviewSummary.silentCount).toBe(silentRatings.length);
    expect(reviewSummary.writtenCount + reviewSummary.silentCount).toBe(reviewSummary.ratingCount);
  });

  /* The Stars component draws five filled stars unconditionally, so a four-star
     rating would be silently redrawn as a five. Nothing in the type system stops
     that; this does. */
  it("publishes nothing that Stars would misrepresent", () => {
    for (const rating of ratings) {
      expect(rating.rating, `${rating.author} is not a five`).toBe(5);
    }
  });

  it("reports the real average rather than an assumed five", () => {
    const mean = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    expect(reviewSummary.average).toBeCloseTo(mean);
  });
});

/**
 * A source the reader has never heard of has to be checkable, or counting it is
 * just us asserting a number. Google and the App Store are their own credentials;
 * anything else needs a link.
 */
describe("attribution", () => {
  it("links any source that is not self-evident", () => {
    for (const rating of ratings) {
      const wellKnown = /google|app store/i.test(rating.source);
      if (!wellKnown) {
        expect(rating.sourceUrl, `${rating.source} needs a link`).toMatch(/^https:\/\//);
      }
    }
  });

  it("attributes every rating to someone", () => {
    for (const rating of ratings) {
      expect(rating.author.trim().length).toBeGreaterThan(0);
      expect(rating.rating).toBeGreaterThanOrEqual(1);
      expect(rating.rating).toBeLessThanOrEqual(5);
    }
  });
});

/**
 * The rating a product page reports to search engines. This is the set of tests
 * worth having: structured data is invisible on the page, so a wrong number here
 * is a claim nobody would ever notice being made on their behalf.
 */
describe("product rating for structured data", () => {
  it("never counts a review of the studio as a review of a product", () => {
    // Client reviews carry no product, which is what keeps them out. If someone
    // ever tags one with a product to get it onto that page, this fails.
    for (const review of reviews) {
      expect(review.product, `${review.author} reviewed the studio, not a product`).toBeUndefined();
    }

    const everyProductRating = products
      .map((product) => productRating(product.slug)?.count ?? 0)
      .reduce((sum, count) => sum + count, 0);
    expect(everyProductRating).toBe(ratings.length - reviews.length);
  });

  it("matches the ratings actually left for that product", () => {
    const mbn = productRating("mybudgetnerd");
    const own = ratings.filter((r) => r.product?.slug === "mybudgetnerd");
    expect(mbn).not.toBeNull();
    expect(mbn!.count).toBe(own.length);
    expect(mbn!.average).toBeCloseTo(own.reduce((s, r) => s + r.rating, 0) / own.length);
  });

  it("returns null for a product nobody has rated, so none is published", () => {
    const unrated = products.filter(
      (product) => !ratings.some((r) => r.product?.slug === product.slug),
    );
    expect(unrated.length, "expected at least one unrated product to cover this").toBeGreaterThan(0);
    for (const product of unrated) {
      expect(productRating(product.slug), `${product.slug} has no ratings`).toBeNull();
    }
  });

  it("states the scale, so a 5 cannot be read as five out of ten", () => {
    const mbn = productRating("mybudgetnerd")!;
    const schema = aggregateRating(mbn.average, mbn.count);
    expect(schema).toMatchObject({
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: mbn.count,
      bestRating: "5",
      worstRating: "1",
    });
  });
});
