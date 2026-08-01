import type { Review } from "./types";

/**
 * Reviews, verbatim and at full length. Clipping one to a pull quote is how a
 * testimonial stops being evidence, so nothing here is shortened.
 *
 * Two sets, because they answer different questions: `reviews` are about
 * working with the studio, `appStoreReviews` are about one shipped product.
 * Both render through the same ReviewCard so a review looks like a review
 * wherever it appears.
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
    quote:
      "Athena Data Labs has been an outstanding partner to work with. Their team is knowledgeable, professional, and always responsive. They take the time to understand your needs and provide reliable, high-quality solutions with excellent attention to detail. Their customer service is exceptional, and they consistently go above and beyond to ensure everything is handled efficiently. I highly recommend Athena Data Labs to anyone looking for a dependable and experienced data solutions provider.",
  },
];

/** MyBudgetNerd's App Store reviews, shown on its product page. */
export const appStoreReviews: Review[] = [
  {
    author: "Buraz Mickey",
    title: "Pro Subscriber Review",
    source: "App Store",
    credential: "United States",
    rating: 5,
    quote:
      "I've really enjoyed using MyBudgetNerd. The design is clean and modern, and the interface is intuitive, making it easy to track spending and stay on top of my budget. It's simple to use while still offering the features I need to manage my finances effectively.",
  },
  {
    author: "To-Lam",
    title: "Easy to Use and Gives You Full Control",
    source: "App Store",
    credential: "United States",
    rating: 5,
    quote:
      "This app is incredibly easy to use and works seamlessly with several of my banks. One of my favorite features is that it doesn't require me to log directly into my bank accounts — I can import data from PDFs instead. The interface is intuitive and gives me complete control over what information I choose to share. I also like that the AI features are optional, which is great for users who may be hesitant about AI. Overall, it's a well-designed, flexible, and privacy-conscious app that I highly recommend.",
  },
];

/** Headline rating for the section label. Recomputed, so it can't drift. */
export const reviewSummary = {
  count: reviews.length,
  average: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
};
