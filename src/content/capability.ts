import type { CapabilityProfile, EntityProfile } from "./types";

/**
 * The company's federal contracting identity.
 *
 * Kept beside the certifications and for the same reason: these are the fields
 * a prime types into a bid, so they carry the same weight as the certification
 * itself and must exist in exactly one place.
 *
 * Every value is read from the SAM.gov entity registration rather than
 * remembered — legal name, UEI, CAGE, and the NAICS and PSC codes from the
 * Assertions section. `legalName` is SAM's form, punctuation included, because
 * the whole point of this block is that it matches the record a prime checks it
 * against, and it is the name as filed. Prose that only needs to name the
 * company, rather than identify it, says "Athena Analytics".
 *
 * Registration is Active, purpose "All Awards", public display on, and expires
 * 2027-08-05. Renewal is annual and lapsing deactivates the SBA certification's
 * public listing with it, so that date is the one to diary.
 */
export const entity: EntityProfile = {
  legalName: "Athena Analytics L.L.C.",
  dba: "Athena Data Labs",
  uei: "X1U1K5TYHVU5",
  cage: "23SR2",

  // Primary first, then by relevance rather than numerically: a reader scanning
  // for fit stops at the first line that matches, and 518210 sorting above the
  // 5415xx codes would bury the ones that describe most of the work.
  naics: [
    { code: "541512", label: "Computer Systems Design Services", primary: true },
    { code: "541511", label: "Custom Computer Programming Services" },
    { code: "541519", label: "Other Computer Related Services" },
    { code: "518210", label: "Computing Infrastructure, Data Processing, and Hosting" },
    { code: "541690", label: "Other Scientific and Technical Consulting Services" },
    { code: "541611", label: "Administrative and General Management Consulting" },
    { code: "541720", label: "Research and Development in the Social Sciences" },
  ],

  psc: [
    { code: "DA01", label: "IT — Business Application and Development Support" },
    { code: "DB02", label: "IT — Compute Support Services (Non-HPC)" },
    { code: "B544", label: "Special Studies and Analysis — Technology" },
    { code: "B599", label: "Special Studies and Analysis — Other" },
    { code: "R425", label: "Professional Support — Engineering and Technical" },
  ],

  email: "info@athenadatalabs.com",
  location: { city: "Ada", state: "Michigan", congressionalDistrict: "MI-03" },
  sam: { status: "Active", purpose: "All Awards" },
  poc: { name: "Vahidin Jupic", title: "Founder & Technical Lead", email: "info@athenadatalabs.com" },
};

/**
 * The capability statement's argument.
 *
 * Written to be read by someone deciding whether to put us on a bid, in the
 * order they decide it: what we do, why us, what we have actually built.
 *
 * `experience` is not headed "past performance" on the page and should never
 * be. Past performance is a term of art meaning federal contracts performed,
 * and ours is commercial. Every entry says whose work it was, and the Defense
 * Department line is flagged as the founder's prior federal employment rather
 * than anything this company was awarded. Blurring that line on a document
 * whose whole purpose is federal procurement is the one mistake here with real
 * consequences.
 */
export const capability: CapabilityProfile = {
  competencies: [
    { title: "Decision Support & Cost Modeling", detail: "Cost estimates, alternatives analysis, and models built to survive review." },
    { title: "Business Intelligence", detail: "Executive dashboards with metrics defined once and computed the same way everywhere." },
    { title: "Forecasting & Predictive Modeling", detail: "Cash, revenue, and demand forecasting with the uncertainty stated honestly." },
    { title: "AI Agents & Retrieval Systems", detail: "LLM systems that cite what they used, built to be checked rather than trusted." },
    { title: "Operations Research", detail: "Optimization, simulation, and scheduling for allocation problems with hard constraints." },
    { title: "Data Pipelines & Automation", detail: "Ingest, parsing, and reporting pipelines that replace recurring manual work." },
  ],

  differentiators: [
    {
      title: "We ship production software, not decks",
      body: "Four products designed, built, and run in-house. Two are on the App Store, one carries a federal capture pipeline in production, and every one is open to inspection before you commit to anything.",
    },
    {
      title: "Ten years inside Defense analysis",
      body: "The founder spent a decade as an operations research analyst and data scientist supporting Army programs, including work on roughly $1.5B in cost-estimate decisions and $276.9M in identified potential savings. The reviewer's questions are familiar because we used to be the reviewer.",
    },
    {
      title: "We already build for this market",
      body: "Thera is capture intelligence software for federal contractors, running in production: live SAM.gov notices, set-aside eligibility, bid decisions. We work inside the procurement cycle rather than reading about it.",
    },
    {
      title: "Privacy-first architecture by default",
      body: "Stateless backends, on-device processing where the work allows it, and explicit consent gates on anything that reaches a model. Written up in public, not asserted in a proposal.",
    },
    {
      title: "Small, senior, and direct",
      body: "The person who writes the code is the person on the call. No account layer between the requirement and the engineer, and no junior staff learning on your contract.",
    },
  ],

  experience: [
    {
      name: "Thera",
      role: "Capture intelligence for federal contractors · In production",
      body: "Built with and for Cerberus Contracting LLC, a veteran-owned government contractor, and now open for signup. Scores live SAM.gov notices against a Digital Twin of a company with visible reasoning and set-aside eligibility gating, then carries each pursuit through to a submission package.",
      to: "/products/thera",
    },
    {
      name: "Aegis BI",
      role: "Business intelligence platform · In production",
      body: "Connects a company's existing workbooks in OneDrive or Google Sheets and turns them into command-center dashboards with forecasting, what-if scenarios, and an in-product AI analyst. Ships on the web and as a native app for iPhone, iPad and Mac.",
      to: "/products/aegis",
    },
    {
      name: "MyBudgetNerd",
      role: "Subscription SaaS · App Store · Paying subscribers",
      body: "A consumer finance product with automated PDF statement parsing, machine-learning transaction categorization, and an analysis engine for forecasting and anomaly detection. 5.0 App Store rating; runs in its own isolated AWS account.",
      to: "/products/mybudgetnerd",
    },
    {
      name: "U.S. Department of Defense",
      role: "Operations Research Analyst & Senior Data Scientist · 2016\u20132026",
      priorToCompany: true,
      body: "Cost models and budget forecasts for multi-billion-dollar Army programs including the Stryker combat system, data validation for contract deliverables, and congressional review visualizations. Achievement Medal for Civilian Service.",
      to: "/about",
    },
  ],
};
