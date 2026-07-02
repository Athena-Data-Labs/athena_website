import type { CaseStudy } from "./types";

export const caseStudies: CaseStudy[] = [
  {
    slug: "aegis-bi-financial-command-center",
    title: "Aegis BI: Building an AI Financial Command Center for Small Business",
    summary:
      "How we designed and built a spreadsheet-native BI platform with forecasting, scenario modeling, and a built-in AI analyst, now in closed beta ahead of its public launch.",
    productSlug: "aegis",
    serviceSlugs: ["dashboards", "forecasting", "ai-solutions"],
    date: "2026-06-15",
    readingTimeMinutes: 7,
    overview: [
      "Aegis BI is our flagship product: an AI-assisted financial intelligence platform for small and mid-sized businesses, currently in closed beta. This case study covers why we built it, the architectural decisions that shaped it, and what building it taught us about decision-first BI.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Small and mid-sized businesses have real financial data but no live picture of it. The numbers sit in spreadsheets and accounting exports; runway, revenue trajectory, and risk are reconstructed manually, quarterly at best. Enterprise BI platforms assume a data warehouse, an analyst team, and a six-month implementation, none of which these companies have.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "The hard constraint was onboarding: if setup requires a data pipeline project, the target customer never gets to value. The platform had to accept the data businesses actually have, a spreadsheet, and produce an executive-grade command center from it, automatically.",
          "The second challenge was trust. Forecasts and AI recommendations are only useful if an operator believes them, which means visible reasoning, honest uncertainty, and a human always in the loop.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "Aegis is spreadsheet-native: upload a workbook, and the platform maps columns, builds a KPI command center (revenue, expenses, net, coverage, margin, runway), and layers on forecasting, anomaly signals, and what-if scenario modeling.",
          "On top of that sits Glaukos, the built-in AI analyst. Glaukos reads the live dashboard context, runs risk-first analysis, and answers questions in plain English: briefings and recommendations with the reasoning shown, never silent actions.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The platform is Python end to end: a Dash (Plotly) front end with analytics running in-process against a Pandas services layer, and a FastAPI backend hosting the AI agents. The defining decision is where data lives: in the user's browser. Uploads are parsed in-session and stored in the browser's on-device database (IndexedDB); the backend is a stateless calculator that persists nothing.",
          "Glaukos and the column-mapping agents call OpenAI's models with careful context engineering: structured dashboard state (metrics, trends, flags) travels with each request, so the analysis references the customer's actual numbers instead of generic financial advice. AI features send data out only with the user's explicit consent, with a strict local mode that forbids it entirely.",
        ],
        bullets: [
          "Dash (Plotly) command-center front end, analytics in-process via Pandas",
          "Stateless FastAPI backend: datasets travel with the request, nothing persisted",
          "On-device storage: the browser's IndexedDB holds each user's source library",
          "OpenAI-powered agents (mapping, Q&A, briefings) gated behind explicit AI consent",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "Aegis BI is in closed beta with the live dashboard open to explore, ahead of its public SaaS and App Store launch. It serves as the flagship proof of our decision-intelligence approach: spreadsheet in, command center out, with an AI analyst that operators can interrogate rather than blindly trust.",
          "It also compounds our consulting work; the platform is the productized form of the dashboards, forecasting, and AI-solutions services we deliver for clients.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "Onboarding friction dominates everything: the decision to be spreadsheet-native, meeting businesses where their data already lives, mattered more than any individual feature.",
          "Privacy can be an architecture, not a policy. Keeping data in the browser and making the backend stateless turned the hardest enterprise objection, \"where does our data go?\", into a one-sentence answer.",
          "AI earns trust through transparency. Showing Glaukos's reasoning, and framing outputs as recommendations to a human decision-maker, made the AI a credible analyst instead of a gimmick.",
        ],
      },
    ],
    relatedInsightSlugs: ["executive-dashboard-design", "ai-agents-human-in-the-loop"],
  },
  {
    slug: "mybudgetnerd-ml-personal-finance",
    title: "MyBudgetNerd: Shipping Privacy-First ML Personal Finance to the App Store",
    summary:
      "From PDF parsing pipeline to 5.0-star iOS app: designing, building, and shipping a consumer ML product with privacy as the architecture, not the disclaimer.",
    productSlug: "mybudgetnerd",
    serviceSlugs: ["ai-solutions", "forecasting", "excel-automation"],
    date: "2026-05-20",
    readingTimeMinutes: 7,
    overview: [
      "MyBudgetNerd is a consumer personal-finance product we took from concept to the App Store, now a subscription SaaS with active subscribers. This case study covers the privacy-first architecture, the ML pipeline behind it, and what shipping a consumer product end-to-end demonstrates about our delivery capability.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Budgeting apps typically force a bad trade: hand over your bank credentials for automatic syncing, or do everything manually and abandon the app in two weeks. Privacy-conscious users, a large and underserved group, refuse the first option and can't sustain the second.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "The product had to deliver automation-grade convenience without bank logins. That meant solving PDF statement parsing across many bank formats, transaction categorization without a cloud of labeled user data, and doing it all with an architecture that could honestly claim privacy-first.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "Users import the PDF statements they already download from their banks. The pipeline extracts every transaction, an ML model categorizes them (learning from the user's corrections), and the analytics layer surfaces trends, forecasts, and statistically flagged anomalies.",
          "AI-powered recommendations are optional and human-in-the-loop: context-aware guidance the user can turn on, not a black box making decisions. Statements are processed in memory, and users control exactly what's shared.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The product runs React on the front end with FastAPI + Python services behind it, deployed on AWS via Amplify and Elastic Beanstalk. The categorization pipeline combines a trained classifier with correction feedback; forecasting and anomaly detection run against each user's own transaction history.",
        ],
        bullets: [
          "PDF parsing across heterogeneous bank statement formats",
          "ML categorization with user-correction feedback loop",
          "Forecasting and statistical anomaly detection per user",
          "In-memory processing; no bank credentials required",
          "AWS deployment: Amplify front end, Elastic Beanstalk services",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "MyBudgetNerd shipped to the App Store and operates today as a subscription SaaS with active subscribers. It holds 5.0-star reviews, with users specifically praising the clean interface, the PDF import workflow, and the privacy-conscious design. That's validation that the architecture bet was the right one.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "Privacy is a product feature when it's structural. Because the architecture genuinely never touches bank credentials, the privacy story required no fine print, and reviewers noticed.",
          "Optional AI beats mandatory AI in consumer products. Making recommendations opt-in built trust with exactly the users most skeptical of AI. Several of them said so in reviews.",
        ],
      },
    ],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop", "practical-forecasting-small-business"],
  },
  {
    slug: "ann-studio-interactive-ml",
    title: "ANN Builder Studio: Making Neural Networks Hands-On",
    summary:
      "Building a live, no-code workspace where anyone can go from raw CSV to a trained neural network, and why we opened the repository.",
    productSlug: "ann-studio",
    serviceSlugs: ["operations-research", "forecasting"],
    date: "2026-04-10",
    readingTimeMinutes: 5,
    overview: [
      "ANN Builder Studio is our live, interactive machine-learning workspace: upload a CSV, clean it, design a neural network visually, train it, and export predictions. This case study covers why we built a free educational tool and what it demonstrates about our ML engineering.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Machine learning stays abstract until you've trained a model yourself, but the standard tooling (Python, notebooks, a dozen libraries) puts that experience out of reach for the business operators and students who'd benefit most from the intuition.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "Compressing a legitimate ML workflow (exploration, preprocessing, architecture design, training, evaluation, prediction) into a guided visual interface without dumbing it down to a toy. Each step had to teach the real concept while doing real work on the user's own data.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "A guided Streamlit workspace that walks users through the full pipeline: data exploration with distributions and correlations, preprocessing for missing values and duplicates, layer-by-layer network design with adjustable neurons and training parameters, then evaluation and prediction export.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "Python end to end: Streamlit for the interactive interface, Pandas for data handling, scikit-learn for the neural-network training and evaluation. The app runs live and the repository is public.",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "The studio runs live and free, serves as a working demonstration of our ML engineering in the open, and doubles as a teaching tool in conversations with clients. It's much easier to discuss forecasting architecture with someone who has just trained a network themselves.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "Interactive beats explanatory: letting people manipulate layers and watch outcomes builds more understanding than any writeup.",
          "Open tools earn trust. A public, working demonstration of capability is more persuasive than claims, a principle that shaped how we present all of our products.",
        ],
      },
    ],
    relatedInsightSlugs: ["practical-forecasting-small-business"],
  },
  {
    slug: "per-route-seo-react",
    title: "Per-Route SEO for a React SPA: Making Every Page Visible to Search",
    summary:
      "A React single-page app looks like one generic page to search engines. How we made this site fully crawlable with per-route metadata, structured data, and a self-generating sitemap, without rewriting to SSR.",
    serviceSlugs: [],
    date: "2026-07-01",
    readingTimeMinutes: 6,
    overview: [
      "This case study is about the site you're reading. athenadatalabs.com is a Vite + React single-page app: fast to build and pleasant to work in, but invisible to search by default. This is the engineering that fixed it, the same playbook we've since shared with independent developers who confirmed it worked for their sites.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "A single-page app ships one HTML document. Every route, from products to articles, shared the same title, description, and social preview baked into index.html. To a search engine deciding which page ranks for \"AI financial dashboard\" or \"React SEO\", the site looked like a single generic page. Deep links couldn't rank because, as far as crawlers could tell, they didn't exist.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "The obvious fix, rewriting to a server-rendered framework, was out of proportion to the problem: a full migration, new hosting requirements, and ongoing complexity for a marketing site. The constraint was to make every route self-describing within the existing stack, with zero new runtime dependencies, and in a way that couldn't silently drift as the site grew to dozens of pages.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "Googlebot executes JavaScript, so the fix is making sure that, once the app runs, each route reports its own identity. We built a small dependency-free Seo component that every page mounts: it sets the document title, meta description, canonical URL, robots directive, Open Graph and Twitter tags, and JSON-LD structured data for that route.",
          "Around it: clean History-API URLs (no hash routing) with a host rewrite rule, route-level code splitting so pages load fast, and a sitemap generated at build time from the same data files that drive the routes, so a new case study or product page is added to the sitemap automatically, with no separate list to forget.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The Seo component upserts head tags on route mount via a React effect: find-or-create each meta tag, set its content, and manage a single JSON-LD script element replaced on navigation. Structured data varies by page type: Service pages emit schema.org Service, product pages SoftwareApplication, and articles like this one emit Article.",
        ],
        bullets: [
          "Dependency-free per-route metadata: title, description, canonical, robots, OG/Twitter",
          "JSON-LD structured data per page type (Service, SoftwareApplication, Article)",
          "BrowserRouter clean URLs + a 404-to-200 rewrite rule on the host",
          "sitemap.xml generated at build time from the site's own content data, so it cannot drift",
          "robots.txt pointing crawlers at the sitemap; Search Console verification and submission",
          "Route-level code splitting and WebP images, since performance is a ranking signal too",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "Every route on this site now reports unique, accurate metadata and structured data, with a self-maintaining sitemap covering the full information architecture. It's verifiable by viewing any page's head in DevTools. Indexing and query performance are tracked in Google Search Console rather than guessed at.",
          "The playbook also proved transferable: we shared this guidance with independent developers on Reddit facing the same invisible-SPA problem, and several implemented it and confirmed their pages were being indexed and their reach expanded. That's the test of a pattern: it works when someone else runs it.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "Know what client-side rendering can and can't do: Google runs JavaScript, but social scrapers don't. Per-route social preview cards are the one thing this approach can't deliver, and being honest about that boundary is part of the engineering.",
          "Generate artifacts from the source of truth. The sitemap builds from the same data files that create the routes, so it's always complete. The class of bug where a page exists but the sitemap doesn't know it simply can't occur.",
        ],
      },
    ],
    relatedInsightSlugs: ["react-spa-seo-best-practices"],
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
