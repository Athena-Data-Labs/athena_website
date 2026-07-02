import type { Service } from "./types";

export const services: Service[] = [
  {
    slug: "data-analytics",
    name: "Data Analytics",
    tag: "ANALYTICS // 01",
    icon: "bar-chart",
    summary:
      "Numbers your team can trust, from data you already have. Clean pipelines, clear definitions, and reporting that answers real questions.",
    headline: "Stop debating the numbers. Start using them.",
    overview: [
      "Most companies don't lack data. They lack confidence in it. Reports disagree, definitions drift between teams, and by the time analysis reaches a decision-maker it's stale. So meetings get spent arguing about whose spreadsheet is right instead of deciding what to do.",
      "We fix the foundation: clean ingestion and transformation pipelines, metrics defined once and computed the same way everywhere, and reporting built around the questions your team actually asks. The payoff isn't more charts. It's that when someone quotes a number, the room believes it.",
    ],
    problems: [
      "Reports from different tools disagree, so meetings turn into audits",
      "Critical analysis lives in one analyst's head or one fragile spreadsheet",
      "Leadership sees month-old snapshots instead of what's happening now",
      "The data exists, but nobody trusts it enough to act on it",
    ],
    technologies: ["Python", "Pandas", "SQL", "FastAPI", "AWS", "Streamlit", "React"],
    benefits: [
      {
        title: "One version of the truth",
        description: "Metrics defined once and served everywhere. The dueling-spreadsheets era ends.",
      },
      {
        title: "Answers, not exports",
        description: "Analysis framed around the operating question it answers, not the table it came from.",
      },
      {
        title: "A foundation that compounds",
        description: "The same clean data layer later powers dashboards, forecasting, and AI agents. Build once, reuse everywhere.",
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
      "AI agents that know your business and answer to your people. Analysis and recommendations you can supervise, audit, and trust.",
    headline: "AI your operators will actually use",
    overview: [
      "AI earns its keep when it's grounded in your real data and accountable to a human. We build agents and LLM-assisted analysis that read live business context, run the analysis your team repeats every week, and hand back recommendations in plain language, with the reasoning visible.",
      "It's the pattern behind Glaukos, the AI analyst inside our Aegis BI platform (now in closed beta), and the recommendation agents in MyBudgetNerd, live on the App Store. Not a demo. Software people use.",
    ],
    problems: [
      "You want AI capability but can't risk a black box making unsupervised calls",
      "Analysts spend hours writing the same narrative summaries of the same reports",
      "Expert knowledge is locked up with two people and doesn't scale",
      "Off-the-shelf chatbots don't know your data, your metrics, or your risks",
    ],
    technologies: ["OpenAI & Claude APIs", "Python", "FastAPI", "React", "AWS", "Retrieval & context engineering"],
    benefits: [
      {
        title: "Grounded in your numbers",
        description: "Agents read live business context, so answers cite your actual figures instead of generic advice.",
      },
      {
        title: "A person stays in charge",
        description: "The agent recommends, your operator decides. Worst case is a bad suggestion, never a bad action.",
      },
      {
        title: "Proven in our own products",
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
      "Command centers your leadership checks before making the call. Live KPIs, alerts on what changed, and drill-downs that answer the follow-up.",
    headline: "The dashboard people open every morning",
    overview: [
      "A dashboard earns its place when a decision-maker checks it before making a call. Most never get there, because they're built around the data instead of the decision. Twenty charts, no answer.",
      "We design command centers the other way around: live KPIs with targets and trend context, alerts that surface what changed since yesterday, and drill-downs that answer the follow-up question before it's asked. Board reporting stops being a monthly fire drill and becomes a view you open.",
    ],
    problems: [
      "KPIs are scattered across tools, so nobody holds the full picture",
      "Existing dashboards are wallpaper: viewed once, never used for decisions",
      "Board and investor reporting eats days of manual assembly every cycle",
      "Anomalies and risks get discovered weeks late, in hindsight",
    ],
    technologies: ["React", "TypeScript", "Recharts / D3", "FastAPI", "Python", "AWS"],
    benefits: [
      {
        title: "Built around decisions",
        description: "Every view answers an operating question: status, trend, risk, action. In that order.",
      },
      {
        title: "Signals, not noise",
        description: "Anomaly flags and threshold alerts tell your team what changed, so they stop scanning and start acting.",
      },
      {
        title: "Board-ready every day",
        description: "The monthly reporting scramble becomes a live view that's always current.",
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
      "Cash, revenue, and demand projected forward with honest uncertainty. See problems while they're still cheap to fix.",
    headline: "Know in March what most companies learn in June",
    overview: [
      "Forecasting is where analytics starts paying for itself. Cash runway, revenue trajectory, demand, and risk, quantified with honest ranges instead of gut feel. The point isn't predicting the future perfectly. It's making better decisions today, while the options are still open.",
      "We build forecasting systems that retrain on your live data and present results in language operators understand. We build this for ourselves too: Aegis BI (closed beta) forecasts cash and revenue with scenario modeling, and MyBudgetNerd, live on the App Store, forecasts personal spending with anomaly detection.",
    ],
    problems: [
      "Cash and revenue projections live in a spreadsheet updated quarterly, if at all",
      "Plans rest on last year's seasonality, and nobody measures forecast error",
      "Unusual transactions and cost drift get caught months late",
      "\"What happens if we hire two more people?\" takes a week of analyst time to answer",
    ],
    technologies: ["Python", "scikit-learn", "statsmodels", "Pandas", "FastAPI", "AWS"],
    benefits: [
      {
        title: "Forward-looking by default",
        description: "Runway, trajectory, and risk quantified continuously, not reconstructed after the quarter closes.",
      },
      {
        title: "What-if in minutes",
        description: "Model hiring, pricing, and spend decisions on the spot instead of waiting a week for analysis.",
      },
      {
        title: "Problems caught early",
        description: "Statistical anomaly detection flags unusual movement while correcting it is still cheap.",
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
      "The three-day monthly report, done in three minutes. Keep the spreadsheets your team knows, lose the copy-paste and the errors.",
    headline: "Give your analysts their week back",
    overview: [
      "Excel runs more businesses than any other tool, and it burns more skilled hours than any other tool. The monthly report that takes three days of copy-paste. The pricing model only one person can safely touch. The workbook that breaks when a column moves. None of that is an Excel problem. It's an automation problem.",
      "We automate the pipeline around your spreadsheets: pulling in source data (including PDFs, using the same document-parsing capability that powers MyBudgetNerd), transforming it reliably, and producing the workbook or report your team already knows. On schedule, without the re-keying, without the silent errors.",
    ],
    problems: [
      "Recurring reports consume days of skilled analyst time on mechanical work",
      "Business-critical workbooks are fragile, unversioned, and understood by one person",
      "Data arrives as PDFs or exports that someone re-keys by hand",
      "Errors slip in quietly and surface in front of leadership",
    ],
    technologies: ["Python", "openpyxl / Pandas", "PDF parsing", "FastAPI", "AWS", "Scheduled pipelines"],
    benefits: [
      {
        title: "Hours back every week",
        description: "Recurring reporting runs on schedule. Your analysts do analysis instead of assembly.",
      },
      {
        title: "Errors caught, not shipped",
        description: "Validated, versioned pipelines replace manual re-keying, so mistakes get caught before distribution.",
      },
      {
        title: "A path to real BI",
        description: "Automated spreadsheets are the natural first step toward live dashboards when you're ready.",
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
      "Schedules, allocations, and plans that are provably better, not just familiar. A few percent found weekly compounds into real money.",
    headline: "The best answer, proven, not guessed",
    overview: [
      "Some decisions are too big for intuition: staff scheduling, resource allocation, routing, inventory policy, capacity planning. When the combinations run into the millions, \"how we've always done it\" quietly leaves money on the table. Operations research applies optimization and simulation to find provably better answers, and the improvement compounds every single cycle.",
      "This is the discipline our founder practiced for over a decade on multi-billion-dollar defense programs, applied to your business. We scope each engagement around one decision that matters, model it honestly (including the messy real-world constraints), and hand your planners an interactive tool they run themselves. Not a slide deck of equations.",
    ],
    problems: [
      "Schedules and allocations are built by hand, and nobody knows how far from optimal they are",
      "Planning decisions interact (staffing, capacity, cost) but get made in isolation",
      "\"We've always done it this way\" is the current optimization algorithm",
      "Trade-offs between cost, service level, and risk get argued instead of quantified",
    ],
    technologies: ["Python", "Linear & integer programming", "Simulation", "Heuristics", "Pandas", "Streamlit"],
    benefits: [
      {
        title: "Trade-offs you can see",
        description: "Cost versus service versus risk laid out as a menu of options, so the argument becomes a choice.",
      },
      {
        title: "A tool, not a report",
        description: "Planners get an interactive what-if interface, so the model keeps earning long after the engagement ends.",
      },
      {
        title: "Savings that compound",
        description: "A few percent improvement on a decision made weekly is a large number by year-end.",
      },
    ],
    relatedProductSlugs: ["ann-studio"],
    relatedCaseStudySlugs: ["ann-studio-interactive-ml"],
    relatedInsightSlugs: ["practical-forecasting-small-business"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
