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
      "Work starts on a privacy-first personal finance app: PDF statement parsing, ML transaction categorization, and forecasting, with no requirement to hand over bank credentials.",
    productSlug: "mybudgetnerd",
  },
  {
    period: "February 2026",
    title: "Athena Analytics LLC formed",
    description:
      "The studio is incorporated on 9 February 2026, a year into building, with two products already written rather than a deck and a plan.",
  },
  {
    period: "21 May 2026",
    title: "MyBudgetNerd ships to the App Store",
    description:
      "First App Store release. A subscription product with paying subscribers and a 5.0 rating. The first thing we shipped that people pay for.",
    productSlug: "mybudgetnerd",
  },
  {
    period: "July 2026",
    title: "Aegis BI launches on web and PWA",
    description:
      "The flagship business intelligence platform goes live: onboarding straight from a workbook or a connected OneDrive or Google Sheets file, cash and revenue forecasting, what-if scenarios, and Glaukos, the in-product AI analyst. Installable as an app on desktop and phone.",
    productSlug: "aegis",
  },
  {
    period: "24–27 July 2026",
    title: "Infrastructure rebuilt, one account per product",
    description:
      "Four days rebuilding the AWS estate from one cluttered account into an account per app, without taking either product down. Written up in full, including the outage, the near-miss that could have detached paying customers from their subscriptions, and the decision made on a premise nobody checked.",
    fieldNoteSlug: "aws-account-per-app-migration",
  },
  {
    period: "August 2026",
    title: "Aegis BI arrives on the App Store",
    description:
      "Apple approves the native release. Aegis BI is now a real app on iPhone, iPad and Mac, sitting alongside the web version, so the command center opens wherever the decision is being made rather than only in a browser tab.",
    productSlug: "aegis",
  },
  {
    period: "August 2026",
    title: "Thera goes live at thera.athenadatalabs.com",
    description:
      "The GovCon capture intelligence platform reaches production on its own deployment, carrying real opportunities, deadlines, and bid decisions for the contractor it was built with. Open by invitation at first, while the feedback loop was one firm deep.",
    productSlug: "thera",
  },
  {
    period: "August 2026",
    title: "Thera opens for signup",
    description:
      "The circle widens past its design partner: open registration, a 14-day free trial of the full platform with no card required, and subscription billing at $200 a month for one company profile, or $2,000 a year. Cerberus still runs its pipeline on it and still shapes what ships next.",
    productSlug: "thera",
  },
  {
    period: "August 2026",
    title: "The Thera network opens",
    description:
      "Thera stops being one-directional. A member can now publish an opt-in listing and be returned inside another member's partner search for a specific live contract, matched on NAICS and service area and ranked above the cold public-data leads. The same release gave listings a federal award record fetched under their own UEI, so one line on a contractor profile is something the government recorded rather than something its owner typed.",
    productSlug: "thera",
  },
  {
    period: "August 2026",
    title: "Closing the loop on being listed",
    description:
      "A network you can join but never measure is a leap of faith, so publishing now reports back: how often your listing surfaced in a real partner search, for how many distinct contracts, and under which codes — never who looked, because which primes are shopping for a partner is their business. Discovered prospects stopped being a name and a state and started arriving with a registered address and a public profile to check. And an outreach composer drafts the first approach from the contract already on screen, so an introduction rides inside a real message about real work rather than going out cold.",
    productSlug: "thera",
    current: true,
  },
];
