import type { Insight } from "./types";

export const insights: Insight[] = [
  {
    slug: "react-spa-seo-best-practices",
    title: "SEO for React Single-Page Apps: A Practical Playbook",
    summary:
      "React SPAs are invisible to search engines by default. Here's the pragmatic checklist we apply — per-route metadata, clean URLs, sitemaps, and knowing when you actually need SSR.",
    date: "2026-06-30",
    readingTimeMinutes: 6,
    categories: ["Web Engineering", "SEO"],
    tags: ["React", "SEO", "Vite", "SPA", "Open Graph"],
    sections: [
      {
        heading: "The problem: one page pretending to be many",
        paragraphs: [
          "A React single-page app ships one HTML file. Every route — your product pages, your articles, your pricing — shares the same title, description, and social preview baked into index.html. To a search engine choosing which page to rank for a query, your site looks like a single generic page.",
          "The good news: Googlebot executes JavaScript. You don't need to rebuild on Next.js to rank — you need to make sure that, once your JS runs, each route reports its own identity.",
        ],
      },
      {
        heading: "Per-route metadata is the 80/20",
        paragraphs: [
          "Every route needs its own title, meta description, and canonical URL, updated when the route mounts. A small component that upserts head tags via useEffect covers this without dependencies — set the title, description, canonical link, robots directive, and Open Graph/Twitter tags from props.",
          "Titles should lead with the page's subject, not the brand: 'Products — Aegis BI, MyBudgetNerd' beats 'Athena Data Labs | Page'. Descriptions are your ad copy in the search results — write them for clicks, not for keyword stuffing.",
        ],
      },
      {
        heading: "Clean URLs, real routes",
        paragraphs: [
          "Hash routing (/#/products) hides everything after the # from crawlers — use the History API (BrowserRouter) with a catch-all rewrite to index.html on your host. On AWS Amplify that's a single 404-to-200 rewrite rule.",
          "Then give crawlers a map: a sitemap.xml listing every route (generate it from the same data that drives your routes, so it never drifts), and a robots.txt pointing to it.",
        ],
      },
      {
        heading: "Know what client-side rendering can't do",
        paragraphs: [
          "Social scrapers — Facebook, LinkedIn, Slack, iMessage — do not run JavaScript. They read the raw HTML, so every route shares the one Open Graph card in index.html. If per-route social previews matter to your funnel, that's the point where you need prerendering or SSR. Be honest about whether they do before taking on that complexity.",
          "Ranking-wise, performance is also a signal: code-split your routes, compress images to WebP, and keep the main bundle lean. The fastest SEO win is often deleting dead kilobytes.",
        ],
      },
      {
        heading: "The checklist",
        paragraphs: ["The order we apply this in practice:"],
        bullets: [
          "BrowserRouter + host rewrite rule (no hash URLs)",
          "Per-route title, description, canonical, and OG tags",
          "sitemap.xml generated from route data + robots.txt",
          "Route-level code splitting and image compression",
          "Structured data (JSON-LD) on content pages",
          "Search Console: verify, submit sitemap, watch coverage",
        ],
      },
    ],
    relatedInsightSlugs: ["executive-dashboard-design"],
    relatedProductSlugs: ["aegis"],
    relatedServiceSlugs: ["dashboards"],
  },
  {
    slug: "executive-dashboard-design",
    title: "Designing Executive Dashboards People Actually Use",
    summary:
      "Most dashboards are chart collections nobody opens twice. The difference is decision-first design: build around operating questions, surface what changed, and treat alerts as the product.",
    date: "2026-06-10",
    readingTimeMinutes: 6,
    categories: ["Business Intelligence", "Design"],
    tags: ["Dashboards", "BI", "KPIs", "Decision Intelligence"],
    sections: [
      {
        heading: "Why dashboards die",
        paragraphs: [
          "The failure mode is always the same: the dashboard answers 'what data do we have?' instead of 'what decision am I making?'. It gets built, demoed, admired — and then everyone goes back to asking the analyst, because scanning twenty charts to infer whether anything needs attention is work.",
          "A dashboard earns a daily open when it does that inference for the reader.",
        ],
      },
      {
        heading: "Start from operating questions",
        paragraphs: [
          "Before any chart, list the questions the owner actually asks: Can we cover next quarter's payroll? Is revenue on trajectory? Which client are we overexposed to? Each view should answer one of these directly — status, trend, and 'so what' — in that order.",
          "This is why we build command centers around a small KPI row (revenue, expenses, net, coverage, margin, runway) with explicit trend deltas, rather than a wall of exploratory charts. Exploration belongs one click deeper.",
        ],
      },
      {
        heading: "Surface change, not state",
        paragraphs: [
          "The most valuable pixel on a dashboard is the one that says something changed. Anomaly flags, threshold alerts, and concentration warnings — computed against the business's own history, not generic limits — convert the dashboard from wallpaper into a monitoring system.",
          "In Aegis BI these are 'signals': expense anomalies and client-concentration risks surfaced automatically, each with enough context to act on. Users check signals first, KPIs second, charts third.",
        ],
      },
      {
        heading: "Design rules we follow",
        paragraphs: ["A few rules that consistently survive contact with real users:"],
        bullets: [
          "One screen, one owner, one rhythm — a board view and an ops view are different products",
          "Every number gets context: target, trend, or comparison — a lone number is trivia",
          "Alerts must be rare enough to matter; tune thresholds until they are",
          "Drill-downs answer the follow-up question, so the meeting doesn't stall on 'why?'",
          "Latency kills trust — if the data is stale, say so on the dashboard",
        ],
      },
      {
        heading: "The AI layer",
        paragraphs: [
          "Once the dashboard is decision-first, an AI analyst multiplies it: plain-English questions against live dashboard context, narrative briefings, and risk-first recommendations. The dashboard supplies the grounding; the AI supplies the interpretation — and the human makes the call.",
        ],
      },
    ],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop", "practical-forecasting-small-business"],
    relatedProductSlugs: ["aegis"],
    relatedServiceSlugs: ["dashboards", "data-analytics"],
  },
  {
    slug: "practical-forecasting-small-business",
    title: "Practical Forecasting for Small-Business Finance",
    summary:
      "You don't need a data science team to forecast cash and revenue usefully. You need clean history, honest uncertainty, and models simple enough to explain to the person betting on them.",
    date: "2026-05-28",
    readingTimeMinutes: 7,
    categories: ["Machine Learning", "Forecasting"],
    tags: ["Forecasting", "Cash Flow", "Anomaly Detection", "Python"],
    sections: [
      {
        heading: "Forecasting is a decision tool, not a crystal ball",
        paragraphs: [
          "The point of a forecast is not to be right — it's to make a decision better before the outcome arrives. 'Runway is 9–14 months under current burn' changes behavior today, even though it's a range. Businesses that wait for certainty get their forecast from the bank balance, which is always too late.",
        ],
      },
      {
        heading: "Simple models, taken seriously, beat complex models ignored",
        paragraphs: [
          "For monthly small-business financials, disciplined classical methods — trend plus seasonality, exponential smoothing, regularized regression on a few known drivers — routinely perform within noise of heavyweight models, and they're explainable to the owner betting payroll on them.",
          "Explainability isn't a nice-to-have: a forecast the operator doesn't understand is a forecast that gets overridden the first time it's inconvenient.",
        ],
      },
      {
        heading: "The inputs matter more than the algorithm",
        paragraphs: [
          "Most forecasting failures are data failures: revenue recognized inconsistently, expenses lumped irregularly, one-off events left in the training history. Before modeling, the history needs the same cleanup discipline as any analytics project — categorize consistently, flag one-offs, and reconcile against source statements.",
          "This is also where anomaly detection pays twice: the same statistical flags that catch a duplicate charge in production also catch the historical outliers that would silently distort the model.",
        ],
      },
      {
        heading: "Show uncertainty or lose trust",
        paragraphs: [
          "Every forecast we ship carries its uncertainty visibly — ranges, not lines. Point forecasts invite false precision; the first miss discredits the system. Ranges set correct expectations and, paired with scenario modeling ('what if we hire two engineers in Q3?'), turn the forecast into an interactive planning tool rather than a prophecy to argue with.",
        ],
      },
      {
        heading: "A practical starting stack",
        paragraphs: ["What we reach for on real engagements:"],
        bullets: [
          "Pandas for history cleanup and feature preparation",
          "statsmodels / scikit-learn for trend, seasonality, and driver models",
          "Backtesting on held-out months before anyone sees a forward number",
          "Statistical anomaly flags on both history and live data",
          "Retraining on a schedule, with forecast error tracked over time",
        ],
      },
    ],
    relatedInsightSlugs: ["executive-dashboard-design"],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedServiceSlugs: ["forecasting", "data-analytics"],
  },
  {
    slug: "ai-agents-human-in-the-loop",
    title: "AI Agents with a Human in the Loop: Trustworthy Automation",
    summary:
      "The AI agents that survive contact with real operations share one design principle: they recommend, humans decide. How we build agents that earn trust instead of demanding it.",
    date: "2026-05-05",
    readingTimeMinutes: 6,
    categories: ["AI", "Automation"],
    tags: ["AI Agents", "LLM", "Human-in-the-Loop", "Claude"],
    sections: [
      {
        heading: "The trust problem",
        paragraphs: [
          "Every organization wants AI leverage; almost none can accept a black box acting unsupervised on their finances or operations. The gap between those two sentences is where most AI projects stall — pilots that impress in demos and never reach production because nobody will sign off on unaccountable automation.",
          "The way through isn't better models. It's better contracts between the agent and the human.",
        ],
      },
      {
        heading: "Recommend, don't act",
        paragraphs: [
          "The agents we ship — Glaukos inside Aegis BI, the recommendation layer in MyBudgetNerd — follow the same contract: the agent analyzes and recommends; the human decides and acts. This single constraint dissolves most adoption resistance, because the worst case is a bad suggestion, not a bad action.",
          "Counterintuitively, it also makes the AI more used, not less: operators consult an advisor freely precisely because it can't do damage.",
        ],
      },
      {
        heading: "Ground the agent in real context",
        paragraphs: [
          "Generic chatbots give generic advice. An agent becomes an analyst when it's grounded: structured, live business context — metrics, trends, flags, history — supplied to the model so every answer references the operator's actual numbers.",
          "This is context engineering, and it's most of the work. The prompt matters less than the pipeline that assembles what the agent knows at the moment it's asked.",
        ],
      },
      {
        heading: "Show the reasoning",
        paragraphs: [
          "Recommendations ship with their 'because': which metrics moved, which risks were weighed, what would change the conclusion. Visible reasoning lets the operator audit the advice at a glance — and audited advice is advice that gets followed.",
          "Risk-first framing helps too: leading with what could go wrong matches how operators actually think about their business, and it inoculates against the perception that the AI is a cheerleader.",
        ],
      },
      {
        heading: "Make it optional",
        paragraphs: [
          "In consumer products especially, mandatory AI alienates the skeptics you most need to convert. In MyBudgetNerd the AI features are opt-in, and users cite that choice in five-star reviews. Adoption you earn is stickier than adoption you force.",
        ],
      },
    ],
    relatedInsightSlugs: ["executive-dashboard-design"],
    relatedProductSlugs: ["aegis", "mybudgetnerd"],
    relatedServiceSlugs: ["ai-solutions"],
  },
];

export const getInsight = (slug: string) => insights.find((i) => i.slug === slug);
