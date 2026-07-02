import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "data-analytics",
    name: "Data Analytics",
    tag: "ANALYTICS // 01",
    icon: "bar-chart",
    summary:
      "Trusted metrics and analysis from raw operational data — pipelines, models, and reporting your team can act on.",
    headline: "From raw data to numbers you can trust",
    overview: [
      "Most organizations don't lack data — they lack confidence in it. Numbers disagree between reports, definitions drift between teams, and by the time analysis reaches a decision-maker it's stale.",
      "We build the analytical foundation that fixes this: clean ingestion and transformation pipelines, clearly defined metrics, and reporting layers that answer real operating questions. The goal isn't more charts — it's one version of the truth your team actually uses.",
    ],
    problems: [
      "Reports from different tools disagree, so meetings are spent debating the numbers instead of the decision",
      "Analysis lives in one analyst's head or one fragile spreadsheet",
      "Leadership sees lagging monthly snapshots instead of live operational signals",
      "Data exists but nobody trusts it enough to act on it",
    ],
    technologies: ["Python", "Pandas", "SQL", "FastAPI", "AWS", "Streamlit", "React"],
    benefits: [
      {
        title: "One version of the truth",
        description: "Metrics defined once, computed consistently, and served everywhere — no more dueling spreadsheets.",
      },
      {
        title: "Decision-ready output",
        description: "Analysis framed around the operating question it answers, not the table it came from.",
      },
      {
        title: "Compounding foundation",
        description: "The same clean data layer powers dashboards, forecasting, and AI agents later — build once, reuse everywhere.",
      },
    ],
    relatedProductSlugs: ["aegis"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center"],
    relatedInsightSlugs: ["executive-dashboard-design", "practical-forecasting-small-business"],
  },
  {
    slug: "ai-solutions",
    name: "AI Solutions",
    tag: "AI // 02",
    icon: "zap",
    summary:
      "AI agents and LLM-powered analysis with human-in-the-loop control — automation your team can supervise and trust.",
    headline: "AI that augments judgment, not replaces it",
    overview: [
      "AI is most valuable when it's grounded in your real data and accountable to a human operator. We build AI agents and LLM-assisted analysis systems that read live business context, run risk-first analysis, and return recommendations in plain language — with the reasoning visible and the human in control.",
      "This is the pattern behind Glaukos, the AI analyst inside our Aegis BI platform (now in closed beta), and the recommendation agents in MyBudgetNerd, live on the App Store.",
    ],
    problems: [
      "Teams want AI capability but can't risk a black box making unsupervised decisions",
      "Analysts spend hours writing the same narrative summaries of the same reports",
      "Domain knowledge is locked up with a few experts and doesn't scale",
      "Off-the-shelf chatbots don't know your data, your metrics, or your risks",
    ],
    technologies: ["OpenAI & Claude APIs", "Python", "FastAPI", "React", "AWS", "Retrieval & context engineering"],
    benefits: [
      {
        title: "Grounded in your data",
        description: "Agents read live dashboard and business context — answers reference your actual numbers, not generic advice.",
      },
      {
        title: "Human-in-the-loop by design",
        description: "Recommendations, not silent actions. Operators see the reasoning and stay in control.",
      },
      {
        title: "Production-proven pattern",
        description: "The same architecture runs in Aegis BI (closed beta) and MyBudgetNerd, live on the App Store.",
      },
    ],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center", "mybudgetnerd-ml-personal-finance"],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop"],
  },
  {
    slug: "dashboards",
    name: "Dashboards",
    tag: "BI // 03",
    icon: "layout-dashboard",
    summary:
      "Executive command centers that unify live KPIs, alerts, and drill-downs — dashboards designed to drive decisions.",
    headline: "Command centers, not chart collections",
    overview: [
      "A dashboard earns its place when a decision-maker checks it before making a call. We design and build executive-grade intelligence dashboards: live KPIs with targets and context, anomaly alerts that surface what changed, and drill-downs that answer the follow-up question before it's asked.",
      "Our flagship product Aegis BI is this service productized — a financial command center with forecasting, scenario modeling, and a built-in AI analyst. For clients, we build the same caliber of system around your metrics and your operating rhythm.",
    ],
    problems: [
      "KPIs are scattered across tools, so nobody has the full picture in one place",
      "Existing dashboards are read-only wallpaper — viewed once, never used for decisions",
      "Board and investor reporting takes days of manual assembly every cycle",
      "Anomalies and risks are discovered weeks late, in hindsight",
    ],
    technologies: ["React", "TypeScript", "Recharts / D3", "FastAPI", "Python", "AWS"],
    benefits: [
      {
        title: "Decision-first design",
        description: "Every view is built around an operating question — status, trend, risk, action — not around the data model.",
      },
      {
        title: "Signals, not noise",
        description: "Anomaly detection and threshold alerts surface what changed so your team stops scanning and starts acting.",
      },
      {
        title: "Executive-ready every day",
        description: "Board-level reporting becomes a live view instead of a monthly fire drill.",
      },
    ],
    relatedProductSlugs: ["aegis"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center"],
    relatedInsightSlugs: ["executive-dashboard-design"],
  },
  {
    slug: "forecasting",
    name: "Forecasting",
    tag: "ML // 04",
    icon: "trending-up",
    summary:
      "Cash, revenue, and demand forecasting with anomaly detection — production ML that improves decision speed and accuracy.",
    headline: "See what's coming before it arrives",
    overview: [
      "Forecasting is where analytics starts paying for itself: cash runway, revenue trajectory, demand, and risk — quantified with honest uncertainty instead of gut feel. We build production forecasting systems that retrain on your live data and present results in language operators understand.",
      "We build this for ourselves too: Aegis BI (closed beta) forecasts cash and revenue with scenario modeling, and MyBudgetNerd — live on the App Store — forecasts personal spending with anomaly detection.",
    ],
    problems: [
      "Cash and revenue projections live in a spreadsheet updated quarterly, if at all",
      "Plans are made on last year's seasonality with no measurement of forecast error",
      "Unusual transactions and cost drift are caught months late",
      "\"What happens if…\" questions take a week of analyst time to answer",
    ],
    technologies: ["Python", "scikit-learn", "statsmodels", "Pandas", "FastAPI", "AWS"],
    benefits: [
      {
        title: "Forward-looking by default",
        description: "Runway, trajectory, and risk quantified continuously — not reconstructed after the quarter closes.",
      },
      {
        title: "Scenario modeling",
        description: "What-if analysis on hiring, pricing, and spend in minutes instead of analyst-weeks.",
      },
      {
        title: "Anomalies caught early",
        description: "Statistical detection flags unusual movement while it's still cheap to correct.",
      },
    ],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center", "mybudgetnerd-ml-personal-finance"],
    relatedInsightSlugs: ["practical-forecasting-small-business"],
  },
  {
    slug: "excel-automation",
    name: "Excel Automation",
    tag: "OPS // 05",
    icon: "table",
    summary:
      "Replace fragile manual spreadsheet workflows with automated pipelines — same familiar output, none of the copy-paste.",
    headline: "Keep the spreadsheet, lose the manual work",
    overview: [
      "Excel runs more businesses than any other tool — and consumes more analyst hours than any other tool. The monthly report that takes three days of copy-paste, the pricing model only one person can update, the workbook that breaks when a column moves: these are automation problems, not Excel problems.",
      "We automate the pipeline around your spreadsheets: ingesting source data (including PDFs — the same document-parsing capability that powers MyBudgetNerd), transforming it reliably, and producing the workbook, report, or dashboard your team already knows — on schedule, without human error.",
    ],
    problems: [
      "Recurring reports consume days of skilled analyst time on mechanical copy-paste",
      "Business-critical workbooks are fragile, unversioned, and understood by one person",
      "Data arrives as PDFs or exports that someone re-keys by hand",
      "Errors slip in silently and surface in front of leadership",
    ],
    technologies: ["Python", "openpyxl / Pandas", "PDF parsing", "FastAPI", "AWS", "Scheduled pipelines"],
    benefits: [
      {
        title: "Hours back every week",
        description: "Recurring reporting runs on schedule; your analysts do analysis instead of assembly.",
      },
      {
        title: "Fewer silent errors",
        description: "Validated, versioned pipelines replace manual re-keying — mistakes get caught before distribution.",
      },
      {
        title: "A path to real BI",
        description: "Automated spreadsheets are a natural first step toward live dashboards when you're ready.",
      },
    ],
    relatedProductSlugs: ["mybudgetnerd", "aegis"],
    relatedCaseStudySlugs: ["mybudgetnerd-ml-personal-finance"],
    relatedInsightSlugs: ["practical-forecasting-small-business", "executive-dashboard-design"],
  },
  {
    slug: "operations-research",
    name: "Operations Research",
    tag: "OR // 06",
    icon: "network",
    summary:
      "Optimization, simulation, and decision modeling — mathematical answers to scheduling, allocation, and planning problems.",
    headline: "The mathematically best answer, not the familiar one",
    overview: [
      "Some decisions are too combinatorial for intuition: staff scheduling, resource allocation, routing, inventory policy, capacity planning. Operations research applies optimization and simulation to find provably better answers — often worth several percent of cost or capacity, which compounds every cycle.",
      "We scope OR engagements around a single decision that matters, model it honestly (including the messy constraints), and deliver the solution as a usable tool — a scenario interface your planners run themselves, not a PDF of equations.",
    ],
    problems: [
      "Schedules and allocations are built by hand and nobody knows how far from optimal they are",
      "Planning decisions interact (staffing ↔ capacity ↔ cost) but are made in isolation",
      "\"We've always done it this way\" is the current optimization algorithm",
      "Trade-offs between cost, service level, and risk are argued, not quantified",
    ],
    technologies: ["Python", "Linear & integer programming", "Simulation", "Heuristics", "Pandas", "Streamlit"],
    benefits: [
      {
        title: "Quantified trade-offs",
        description: "Cost vs. service vs. risk expressed as a frontier you can choose from, not a debate.",
      },
      {
        title: "Deployed as a tool",
        description: "Planners get an interactive what-if interface, so the model keeps earning after the engagement ends.",
      },
      {
        title: "Compounding savings",
        description: "A few percent improvement on a decision made weekly is a large number by year-end.",
      },
    ],
    relatedProductSlugs: ["ann-studio"],
    relatedCaseStudySlugs: ["ann-studio-interactive-ml"],
    relatedInsightSlugs: ["practical-forecasting-small-business"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
