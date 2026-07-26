import type { Milestone } from "./types";

/**
 * The company's own build log. Its job is recency: a visitor deciding whether
 * a small studio is a going concern should be able to see the last thing that
 * shipped without taking anyone's word for it.
 *
 * Add an entry whenever something ships. The newest one drives the "last
 * shipped" line on the products page, so a stale list is visible rather than
 * quietly wrong.
 */
export const milestones: Milestone[] = [
  {
    period: "Early 2025",
    title: "ANN Builder Studio goes live",
    description:
      "The first thing we published: a browser-based workspace for building and training neural networks without writing code. More technical demonstration than product, and still the fastest way to see how we think about machine learning.",
    productSlug: "ann-studio",
  },
  {
    period: "October 2025",
    title: "MyBudgetNerd development begins",
    description:
      "Work starts on a privacy-first personal finance app: PDF statement parsing, ML transaction categorisation, and forecasting, with no requirement to hand over bank credentials.",
    productSlug: "mybudgetnerd",
  },
  {
    period: "February 2026",
    title: "Athena Analytics LLC formed",
    description:
      "The studio is incorporated on 9 February 2026, a year into building, with two products already written rather than a deck and a plan.",
  },
  {
    period: "Spring 2026",
    title: "MyBudgetNerd ships to the App Store",
    description:
      "Live on the App Store as a subscription product with paying subscribers and a 5.0 rating. The first thing we shipped that people pay for.",
    productSlug: "mybudgetnerd",
  },
  {
    period: "June 2026",
    title: "Aegis BI reaches production",
    description:
      "The flagship business intelligence platform goes live: spreadsheet-native onboarding, cash and revenue forecasting, what-if scenarios, and Glaukos, the in-product AI analyst.",
    productSlug: "aegis",
  },
  {
    period: "July 2026",
    title: "Infrastructure rebuilt, one account per product",
    description:
      "Two days rebuilding the AWS estate from one cluttered account into an account per app, with paying users signed in throughout. Written up in full, including the outage and the four other things that went wrong.",
    fieldNoteSlug: "aws-account-per-app-migration",
  },
  {
    period: "In progress",
    title: "Thera runs a live capture pipeline",
    description:
      "The GovCon capture intelligence platform is in active development and already running real opportunities, deadlines, and bid decisions for its design partner.",
    productSlug: "thera",
    current: true,
  },
];
