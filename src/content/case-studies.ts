import type { CaseStudy } from "./types";

export const caseStudies: CaseStudy[] = [
  {
    slug: "privacy-first-architecture-security",
    title: "The Power of Privacy: How Ephemeral Backends Make Our Products Harder to Breach",
    summary:
      "You can't leak what you never stored. How one architectural decision, backends that hold as little user data as possible for as short a time as possible, runs through Aegis BI, MyBudgetNerd, and the upcoming Thera, and why it's a security strategy, not just a privacy stance.",
    seoDescription:
      "How privacy-first architecture becomes a security strategy: ephemeral, stateless backends and data minimization shrink breach risk across Aegis BI, MyBudgetNerd, and Thera.",
    keywords: [
      "privacy-first architecture",
      "ephemeral backend",
      "data minimization",
      "stateless backend security",
      "privacy by design",
      "secure SaaS architecture",
      "fintech data privacy",
    ],
    serviceSlugs: ["ai-solutions", "dashboards"],
    date: "2026-07-18",
    readingTimeMinutes: 11,
    overview: [
      "Every product we ship handles data people are right to be careful with: company financials in Aegis BI, personal bank statements in MyBudgetNerd, competitive capture strategy in Thera. The conventional SaaS answer is to collect all of it into a central database and promise to protect it.",
      "We made the opposite bet across the whole product line: design the backend so it holds as little user data as possible, for as short a time as possible. This case study walks through how that one decision plays out in three different architectures, and why it protects both our users and us as the operators.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "The standard architecture for a data product concentrates risk by default. Users upload their financial records into a central database, and that database grows into two things at once: the most valuable asset the company owns, and the largest concentration of sensitive customer information it holds.",
          "From that point on, security is a continuous obligation with no finish line. Every additional dependency, credential, and endpoint increases operational risk, and because all customers share one store, the impact of a single compromise extends to the entire customer base.",
          "The exposure runs in both directions. Users risk their data; the operator takes on everything attached to holding it: breach disclosure obligations, regulatory liability, subpoena scope, insider risk, and the ongoing operational burden of acting as custodian for thousands of people's bank records.",
          "For a small team shipping consumer and business finance products, that risk profile is a business constraint before it is a technical problem.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "The simplest mitigation, collecting nothing, is not available to products whose entire value is analyzing the user's data. Aegis BI has to compute forecasts over a company's ledger. MyBudgetNerd has to parse and categorize real bank statements. Thera has to maintain a detailed profile of a contractor's capabilities and pricing history.",
          "The challenge was to deliver that analysis while refusing, structurally, to become a warehouse of the underlying data.",
          "And it had to be structural. A privacy policy is a promise that can drift with every release; we wanted claims that are enforced by the architecture itself, so the honest answer to \"where does our data go?\" is short, checkable, and independent of anyone's discipline.",
          "It helps to be precise about terms here. Privacy and security are related but distinct goals: privacy determines what information should be collected and who may access it; security determines how that information is protected against unauthorized access. Most architectures treat them as separate workstreams. By minimizing the amount of customer data that exists in the first place, one architectural decision strengthens both: there is less to govern, and less to defend.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "Across the product line, the backend is ephemeral: it computes on data while a request is in flight and holds none of it afterward. Each product applies the principle at a different point on the spectrum, because each has different constraints.",
          "Aegis BI keeps the data on the user's machine entirely. Uploaded workbooks are parsed in-session and stored in the browser's on-device database (IndexedDB); the backend is a stateless calculator. When a dashboard computes or an AI agent runs, the dataset travels with the request, is processed, and is discarded.",
          "Multiple companies can use one Aegis deployment without their data ever mixing, because no server-side copy exists to mix.",
          "MyBudgetNerd processes statements server-side but request-by-request, in memory. A PDF is parsed, transactions are extracted and categorized, results return to the device, and nothing is retained as a customer dataset. There are no bank logins at all. Users import statements they already have, so the product never touches a bank credential. Any history the user wants kept lives on their own device, with a retention window they choose, down to \"off\".",
          "Thera, our upcoming capture-intelligence platform, is the case where persistence is genuinely required; a Digital Twin only works if it lives somewhere. There, the principle becomes legibility instead of statelessness: one server, three containers, one SQLite database file.",
          "Every piece of Thera customer data can be enumerated from that single database, with nothing scattered across cloud services and no third-party analytics. The only copy that leaves the server is a nightly encrypted, auto-expiring backup. Each organization's learning loop runs inside its own boundary; no customer's data is pooled with another's.",
        ],
        diagram: {
          groups: [
            {
              title: "Traditional SaaS",
              flows: [
                [
                  { label: "User" },
                  { label: "Application" },
                  { label: "Central Database", kind: "store" },
                  { label: "Backups", kind: "store" },
                ],
                [
                  { label: "Central Database", kind: "store" },
                  { label: "Analytics" },
                  { label: "AI Services" },
                ],
              ],
            },
            {
              title: "Athena Data Labs",
              flows: [
                [
                  { label: "User Device", kind: "store" },
                  { label: "Browser" },
                  { label: "Stateless Backend" },
                  { label: "Response" },
                ],
              ],
            },
          ],
          caption:
            "The comparison illustrates where data persists (highlighted nodes), not application complexity. A traditional SaaS accumulates customer data in a central database and every system downstream of it; in our architecture, the only persistent store is the user's own device, and the backend processes each request without retaining anything.",
        },
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The implementation reduces to three recurring themes: where data is allowed to rest, what the AI layer is allowed to see, and how much infrastructure exists to defend.",
          "The AI layer gets the same treatment as storage, because model calls are the other path by which user data can leave the system. In every product, AI is opt-in, payloads are minimized, and external calls are outbound-only, made on an explicit user action.",
        ],
        bulletGroups: [
          {
            title: "Data Storage",
            bullets: [
              "Client-side persistence (Aegis BI): each user's source library, saved scenarios, and briefing history live in per-browser IndexedDB; the dataset rides in the request body to a stateless FastAPI backend and is never persisted server-side",
              "Stateless processing (MyBudgetNerd): in-memory PDF parsing with no persistent statement storage; account numbers are extracted for parsing, stripped from responses, and never persisted or forwarded to any external service",
              "User-controlled retention (MyBudgetNerd): learned categorization rules and any kept history stay in the user's device storage, never shared across users or used for global training",
              "Controlled persistence (Thera): all customer data in one SQLite database file on one server, with a nightly encrypted, auto-expiring backup as the only off-server copy",
            ],
          },
          {
            title: "AI Layer",
            bullets: [
              "Opt-in by default: no product sends data to a model without an explicit user action; Aegis BI offers tiered privacy modes from strict-local (AI forbidden entirely) to consent-based",
              "Minimal payloads: Aegis BI column mapping sees headers plus a capped row sample, not the dataset; Thera's Anthropic calls are per-request generation only, not used for training",
              "Sanitization: MyBudgetNerd's AI refinement sees sanitized transaction descriptions only",
              "Guardrails: in MyBudgetNerd's Advisor mode the numbers are computed on-device while the model only rephrases wording, with a server-side numeric guard rejecting any AI sentence that cites a figure the brief doesn't contain",
            ],
          },
          {
            title: "Infrastructure",
            bullets: [
              "TLS on every connection; Thera runs as three containers on a single server, with sessions kept in the user's browser",
              "Local caching of public data: SAM.gov and USAspending records are cached on the Thera server rather than routed through third parties",
              "Logging and monitoring configured to exclude sensitive data: Aegis BI error monitoring never sends request bodies or PII",
              "No third-party trackers or analytics anywhere in MyBudgetNerd",
            ],
          },
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "The clearest way to state the security result is as a set of architectural properties, stated as facts about the system rather than performance claims:",
        ],
        bullets: [
          "Zero persistent customer datasets on the Aegis BI backend",
          "Zero stored bank credentials anywhere in the product line",
          "Zero cross-customer financial databases",
          "User-controlled retention in MyBudgetNerd, down to no retention at all",
          "One SQLite database as Thera's entire customer-data footprint",
          "One encrypted backup per day, with automatic expiration",
          "No PII or request bodies sent to monitoring systems",
          "Stateless, request-by-request processing in Aegis BI and MyBudgetNerd",
        ],
        closingParagraphs: [
          "These properties have direct operational consequences. The worst-case outcome of a compromised Aegis BI or MyBudgetNerd backend is bounded, because the server holds no accumulated user data to exfiltrate; an attacker who reaches the backend finds compute, not a dataset. The attack surface that matters, the set of places where customer data rests, is smaller by construction rather than by policy.",
          "Minimization also removed entire categories of operational work. Encryption-at-rest schemes for a central statement store, access audits over that store, retention and deletion tooling: none of these had to be built, so none of them can fail or drift. Auditing reduces to enumerating what exists, and for Thera, disaster recovery planning reduces to restoring a single encrypted file.",
          "Customer-facing processes shorten for the same reason. A security review can trace the complete data flow in one sitting, compliance discussions start from what is never collected, and the scope of any subpoena or disclosure obligation is limited to data that actually exists. Insider risk shrinks in parallel: operators cannot browse records the system never stores.",
          "Finally, the architecture is a trust result. \"Your data stays in your browser; the backend stores nothing\" is a one-sentence answer to the hardest enterprise objection, and it is verifiable rather than contractual. MyBudgetNerd's App Store reviews cite the privacy-conscious design specifically, evidence that users notice the difference between a policy and an architecture.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "Data you don't hold is data you can't lose. Minimization beats mitigation: every security control we didn't have to build is a control that can't fail, and absent data can't be exfiltrated, mis-logged, or subpoenaed.",
          "Privacy must be architecture, not policy. A promise in a privacy page can drift with any release; a backend with no database cannot. Making the claims structural is what makes them durable, and what makes them credible to the people most skeptical of data products.",
          "When persistence is unavoidable, make it legible. Thera taught us the complement to statelessness: if you must hold customer data, hold it somewhere you can point to: one file, one server, enumerable in a single table. Knowing precisely where every byte lives is itself a security property.",
          "The same discipline applies to AI calls. Model APIs are a data egress path like any other; opt-in gating, sanitized minimal payloads, and guards that keep models from generating the numbers extend the ephemeral-backend principle into the AI layer.",
          "The broader lesson is that data minimization is a design principle, not a compliance checkbox. Every system we design begins with the same questions:",
        ],
        bullets: [
          "Does this data need to exist?",
          "Does it need to leave the user's device?",
          "If it must exist, how long should it exist?",
          "Can we reduce the amount collected?",
          "Can we make its storage location explicit and understandable?",
        ],
        closingParagraphs: [
          "The answers differ across Aegis BI, MyBudgetNerd, and Thera, but the questions never change. Privacy-first architecture is not a feature to list on a pricing page; it is an engineering discipline, applied at design time, that determines what a system can leak long before anyone has to defend it. You can't leak what you never stored.",
        ],
      },
    ],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop"],
  },
  {
    slug: "aegis-bi-financial-command-center",
    title: "Aegis BI: Building an AI Financial Command Center for Small Business",
    summary:
      "How we designed and built a spreadsheet-native BI platform with forecasting, scenario modeling, and a built-in AI analyst, now live in production.",
    productSlug: "aegis",
    serviceSlugs: ["dashboards", "forecasting", "ai-solutions"],
    date: "2026-06-15",
    readingTimeMinutes: 7,
    overview: [
      "Aegis BI is our flagship product: an AI-assisted financial intelligence platform for small and mid-sized businesses, now live in production. This case study covers why we built it, the architectural decisions that shaped it, and what building it taught us about decision-first BI.",
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
          "Aegis BI runs live in production, with the dashboard open to explore and companies onboarded directly; public SaaS plans and an App Store release are next on the roadmap. It serves as the flagship proof of our decision-intelligence approach: spreadsheet in, command center out, with an AI analyst that operators can interrogate rather than blindly trust.",
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
  {
    slug: "search-console-indexing-fix",
    title: "From One Page Indexed to All 27: Fixing a Search Console Crawl Block",
    summary:
      "A newly launched site was live and built correctly, but Google had indexed exactly one page and kept rejecting the sitemap with \"Couldn't fetch.\" The cause wasn't the site. It was a protocol mismatch in Search Console.",
    serviceSlugs: [],
    date: "2026-07-02",
    readingTimeMinutes: 4,
    overview: [
      "This is the operations sequel to our per-route SEO case study. The architecture was already done: every page had its own metadata and the sitemap listed all 27 routes. Yet weeks after launch, Google Search Console still showed a single indexed URL and refused to read the sitemap at all. Here is how we found the real cause and cleared it in a day.",
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Three symptoms, one site. Searching the company name returned only the homepage. The pages that actually drive business, /services and /products and everything beneath them, were invisible in search. And every attempt to submit the sitemap in Search Console failed with the same terse error: \"Couldn't fetch.\"",
          "Nothing was wrong with the pages. They loaded, they were correct, and the sitemap opened fine in a browser. Google just would not read it.",
        ],
      },
      {
        heading: "Challenge",
        paragraphs: [
          "\"Couldn't fetch\" is one of the least specific errors Google gives you. It sends most people rewriting their sitemap or blaming their host, and both are usually wrong. The real work was resisting that instinct and isolating where the request actually broke.",
          "It traced back to three overlapping causes:",
        ],
        bullets: [
          "Protocol mismatch: the Search Console property was set up on the http:// origin, while the live server serves and enforces https://.",
          "A redirect read as a failure: fetching the sitemap over http:// returned a security redirect to https://. Against the http property, Google logged that as a failed fetch instead of following it.",
          "Piecemeal submission: individual paths had been handed to Search Console instead of one canonical sitemap.xml, which muddied discovery further.",
        ],
      },
      {
        heading: "Solution",
        paragraphs: [
          "The fix was configuration, not code, and it took three moves:",
        ],
        bullets: [
          "Align the property with the protocol the site actually serves, managing it from the https:// property so the sitemap request and the server finally agree.",
          "Submit one canonical sitemap.xml covering all 27 routes, instead of loose individual URLs.",
          "Re-submit through the matching secure property, giving Google a clean fetch with no redirect to trip over.",
        ],
      },
      {
        heading: "Technical Implementation",
        paragraphs: [
          "The footprint spans a few properties: the main marketing domain, the Aegis BI app on its own subdomain, and MyBudgetNerd on a separate domain. The block was on the marketing domain, and every step was checked in Search Console rather than assumed.",
        ],
        bullets: [
          "Moved from the http:// URL-prefix property to the canonical https:// property (a Domain property resolves this cleanly too).",
          "Confirmed the sitemap URL returned a 200 over https://, not a redirect, from the property's point of view.",
          "Submitted the single auto-generated sitemap.xml covering services, products, and resources.",
          "Checked that robots.txt pointed at the same canonical sitemap location.",
        ],
      },
      {
        heading: "Results",
        paragraphs: [
          "The sitemap went from a hard \"Couldn't fetch\" to a clean Success on resubmission. Within a day, Google's discovered pages went from a single root URL to all 27 routes in the sitemap.",
          "It also cleared the runway for paid acquisition. Ad crawlers read landing-page copy over the same secure requests, so a future Google Ads account starts on clean pathways instead of fighting the block that was hiding the pages from organic search.",
        ],
      },
      {
        heading: "Lessons Learned",
        paragraphs: [
          "\"Couldn't fetch\" is usually a mismatch, not a broken sitemap. Most of the time the file is fine and the property protocol, or a redirect the property can't follow, is the real culprit. Check that before you touch the XML.",
          "A correct site can still be invisible. Good architecture gets you crawlable pages; it does not guarantee the search engine is configured to read them. The build and the operations are two separate jobs, and both have to be right.",
        ],
      },
    ],
    relatedInsightSlugs: ["react-spa-seo-best-practices"],
  },
];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);
