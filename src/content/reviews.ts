import type { Review } from "./types";

/**
 * Reviews, verbatim. `quote` is never shortened: clipping a testimonial down to
 * whatever flatters us is how it stops being evidence, and About prints all of
 * them at full length for exactly that reason.
 *
 * `excerpt` exists because the homepage cannot. Four full reviews there is more
 * text than anyone standing at the front door will read, so the rail shows one
 * sentence and points at the page that prints the rest. The sentence is an exact
 * substring of the quote, enforced by a test, so an excerpt can never quietly
 * become a paraphrase of what somebody said.
 *
 * Three sets, because they answer different questions and carry different
 * weight: `reviews` are clients who hired the studio, `appStoreReviews` are
 * strangers paying for a shipped product, `peerPushRatings` are peers in a
 * maker directory. Kept separate even where all three are shown, because they
 * are not interchangeable evidence — a client review is from someone we sold to,
 * an App Store review is from someone who owed us nothing, and a directory
 * rating is from another developer. Blended into one anonymous wall of stars the
 * strongest of them is averaged down to the weakest, so every card names where
 * it came from.
 */

/** Company-level, left on our Google Business profile. Newest first. */
export const reviews: Review[] = [
  {
    author: "Joshua Schwartz",
    org: "Cerberus Contracting",
    credential: "Local Guide · 94 reviews",
    source: "Google Review",
    date: "2026-07-29",
    dateLabel: "July 2026",
    rating: 5,
    excerpt:
      "What stood out was that they clearly understood the problem I was trying to solve, not just the request I handed them.",
    quote:
      "Government contracting is an area where the information you need is scattered, dense, and easy to get wrong. Athena Data Labs cut through that for us here at Cerberus Contracting. They were extremely helpful in finding the right information and getting it into a form I could actually use not a pile of raw data, but the specific answers my business needed to move forward. What stood out was that they clearly understood the problem I was trying to solve, not just the request I handed them. For a small business trying to compete for government work without a full data team in-house, that kind of support is genuinely valuable. I'd recommend them without hesitation.",
  },
  {
    author: "Khalil Chahine",
    role: "Owner",
    org: "Ray's Drugs & Medical Supplies",
    orgUrl: "https://raysdrugs.com",
    credential: "Local Guide · 15 reviews",
    source: "Google Review",
    date: "2026-07-11",
    dateLabel: "July 2026",
    rating: 5,
    excerpt:
      "They take the time to understand your needs and provide reliable, high-quality solutions with excellent attention to detail.",
    quote:
      "Athena Data Labs has been an outstanding partner to work with. Their team is knowledgeable, professional, and always responsive. They take the time to understand your needs and provide reliable, high-quality solutions with excellent attention to detail. Their customer service is exceptional, and they consistently go above and beyond to ensure everything is handled efficiently. I highly recommend Athena Data Labs to anyone looking for a dependable and experienced data solutions provider.",
  },
];

/** MyBudgetNerd's App Store reviews, shown on its product page and the homepage. */
export const appStoreReviews: Review[] = [
  {
    author: "Buraz Mickey",
    title: "Pro Subscriber Review",
    source: "App Store",
    product: { name: "MyBudgetNerd", slug: "mybudgetnerd" },
    credential: "United States",
    rating: 5,
    excerpt:
      "The design is clean and modern, and the interface is intuitive, making it easy to track spending and stay on top of my budget.",
    quote:
      "I've really enjoyed using MyBudgetNerd. The design is clean and modern, and the interface is intuitive, making it easy to track spending and stay on top of my budget. It's simple to use while still offering the features I need to manage my finances effectively.",
  },
  {
    author: "To-Lam",
    title: "Easy to Use and Gives You Full Control",
    source: "App Store",
    product: { name: "MyBudgetNerd", slug: "mybudgetnerd" },
    credential: "United States",
    rating: 5,
    excerpt:
      "One of my favorite features is that it doesn't require me to log directly into my bank accounts — I can import data from PDFs instead.",
    quote:
      "This app is incredibly easy to use and works seamlessly with several of my banks. One of my favorite features is that it doesn't require me to log directly into my bank accounts — I can import data from PDFs instead. The interface is intuitive and gives me complete control over what information I choose to share. I also like that the AI features are optional, which is great for users who may be hesitant about AI. Overall, it's a well-designed, flexible, and privacy-conscious app that I highly recommend.",
  },
];

/**
 * MyBudgetNerd's ratings on PeerPush, a product-discovery directory.
 *
 * Worth being straight about what these are. PeerPush is where makers list what
 * they built, so a rating there is from another developer rather than from
 * somebody who pays for the app — weaker evidence than either set above, and
 * that is exactly why the source is named on the card and linked. A reader who
 * has never heard of PeerPush can go and see what it is, and one who has can
 * weigh it accordingly. Hiding a source we were willing to count would be the
 * only version of this that is not honest.
 *
 * Two of the three wrote nothing. There was also a comment on the listing —
 * "Thank you I was just looking for this" — which is not in here: it is a
 * reaction to a post by somebody who had not used the app yet, and printing it
 * as a review would be inventing evidence rather than reporting it.
 */
const PEERPUSH_URL = "https://peerpush.com/p/mybudgetnerd-iuzc";

export const peerPushRatings: Review[] = [
  {
    author: "@mydebtlens",
    source: "PeerPush",
    sourceUrl: PEERPUSH_URL,
    product: { name: "MyBudgetNerd", slug: "mybudgetnerd" },
    date: "2026-07-21",
    dateLabel: "July 2026",
    rating: 5,
  },
  {
    author: "@jankolar24",
    source: "PeerPush",
    sourceUrl: PEERPUSH_URL,
    product: { name: "MyBudgetNerd", slug: "mybudgetnerd" },
    date: "2026-07-12",
    dateLabel: "July 2026",
    rating: 5,
    // Verbatim, typo included. Tidying somebody's spelling is a small edit that
    // turns their sentence into ours, and the rest of this file holds the same
    // line — the Cerberus review keeps a dropped word for the same reason.
    excerpt: "Love the graphics and graphs, verry nice app :)",
    quote: "Love the graphics and graphs, verry nice app :)",
  },
  {
    author: "@WurtApp",
    source: "PeerPush",
    sourceUrl: PEERPUSH_URL,
    product: { name: "MyBudgetNerd", slug: "mybudgetnerd" },
    date: "2026-07-09",
    dateLabel: "July 2026",
    rating: 5,
  },
];

/**
 * Every rating anyone has left us, strongest evidence first: clients who hired
 * the studio, then strangers paying for the app, then peers in a directory.
 * Order matters because it is also the order the rail shows them in, and the
 * first card is the one most people will read.
 */
export const ratings: Review[] = [...reviews, ...appStoreReviews, ...peerPushRatings];

/** The ones that actually said something. Only these get a card of their own. */
export const writtenReviews: Review[] = ratings.filter((r) => r.quote);

/**
 * Ratings with nothing written. Listed by name rather than folded into a count,
 * because "and two more rated us five stars" is a claim about people whose
 * existence the reader has to take on faith, while a handle, a source and a date
 * is something they can go and look at.
 */
export const silentRatings: Review[] = ratings.filter((r) => !r.quote);

/**
 * Figures for the section copy. All recomputed from the arrays above, so no
 * number stated in prose can drift away from the cards underneath it.
 *
 * `ratingCount` and `writtenCount` are deliberately separate. Reporting seven
 * and showing five cards invites "where are the other two?", and the answer —
 * they are star ratings with nothing written — is one the copy has to give
 * rather than leave the reader to work out.
 */
export const reviewSummary = {
  ratingCount: ratings.length,
  writtenCount: writtenReviews.length,
  silentCount: silentRatings.length,
  average: ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length,
  clientCount: reviews.length,
  appStoreCount: appStoreReviews.length,
  peerPushCount: peerPushRatings.length,
};

/**
 * What one product is rated, across every source that rated it.
 *
 * The filter on `product` is the load-bearing part, and it is doing more than
 * tidying. The studio's client reviews carry no product, so they cannot reach
 * this — which is the point: someone praising how we work is not rating
 * MyBudgetNerd, and folding those two together would hand an app a score built
 * partly from opinions of something else entirely. The structured data on a
 * product page is a claim about that product, and this is the only set of
 * numbers entitled to back it.
 *
 * Null rather than a zeroed object when nothing has rated it, so a caller has to
 * decide what to do about it and cannot accidentally publish "0.0 from 0".
 */
export const productRating = (slug: string) => {
  const own = ratings.filter((rating) => rating.product?.slug === slug);
  if (own.length === 0) return null;
  return {
    count: own.length,
    average: own.reduce((sum, rating) => sum + rating.rating, 0) / own.length,
  };
};
