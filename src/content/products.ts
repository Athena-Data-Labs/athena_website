import type { Product } from "./types";

export const products: Product[] = [
  {
    slug: "aegis",
    name: "Aegis BI",
    tag: "Flagship · On the App Store",
    icon: "aegis",
    tagline: "AI Financial Intelligence",
    summary:
      "AI-assisted financial intelligence that stays current: connect OneDrive or Google Sheets, then read the numbers anywhere through command-center dashboards, forecasting, what-if scenarios, and the Glaukos AI analyst.",
    seoDescription:
      "AI financial intelligence from $50/mo: dashboards, forecasting and an AI analyst, fed by OneDrive or Google Sheets. On the App Store and the web.",
    overview: [
      "Aegis BI is our flagship business-intelligence platform, now live in production on the web and on the App Store. Point it at the numbers you already keep: upload a workbook, or connect OneDrive or Google Sheets so the dashboard moves when the source file does. Aegis maps the columns, builds a command-center dashboard, forecasts cash and revenue, runs what-if scenarios, and answers questions in plain English through Glaukos, its built-in AI analyst.",
      "It runs on a phone and a Mac as well as in a browser, and that is not a checkbox. The decisions it informs are rarely made at a desk. A founder in a meeting, an operator on a site visit, and a partner waiting at an airport should all be able to open the same current numbers and answer the question in front of them, rather than promising to look it up when they get back.",
      "It is built to run as a company's primary BI system, from board reporting to daily operations, without a data team to stand it up. Privacy-first by architecture: uploaded data stays in your browser, and the backend is a stateless calculator that stores nothing.",
    ],
    problem: [
      "Small and mid-sized businesses run on spreadsheets: the numbers exist, but there's no live picture of cash, revenue trajectory, or risk. Traditional BI platforms assume a data warehouse and an analyst team most companies don't have.",
      "Aegis closes that gap without a pipeline project. It reads the files you already keep, and if those files live in OneDrive or Google Sheets it keeps reading them, so the dashboard is current instead of correct-as-of-last-Tuesday.",
      "The second gap is where the answer reaches you. A report that only opens on the office desktop is a report you cannot use in the room where the decision happens, which is why Aegis ships as a native app on iPhone, iPad and Mac alongside the browser version.",
    ],
    features: [
      { title: "Command-Center Dashboard", description: "Live KPIs (revenue, expenses, net, coverage, margin, runway) with trend context and targets." },
      { title: "Cash & Revenue Forecasting", description: "Forward-looking projections with honest uncertainty, retrained as new data arrives." },
      { title: "What-If Scenarios", description: "Model hiring, pricing, and spend decisions and see the downstream impact instantly." },
      { title: "Signal Alerts", description: "Expense anomalies, client concentration, and risk flags surfaced automatically." },
      { title: "Glaukos · AI Analyst", description: "Ask your data in plain English. Risk-first analysis, briefings, and recommendations with visible reasoning." },
      { title: "Spreadsheet-Native Onboarding", description: "Upload a workbook; Aegis maps columns and builds the dashboard. No ETL project required." },
      { title: "OneDrive & Google Sheets", description: "Connect the file where it already lives and the dashboard follows it, so the numbers are current without a re-upload." },
      { title: "On the App Store", description: "A native app on iPhone, iPad and Mac, so the command center comes into the meeting, the site visit, or the airport lounge." },
    ],
    technologies: ["Python", "Dash (Plotly)", "FastAPI", "Pandas", "OpenAI API", "OneDrive API", "Google Sheets API", "IndexedDB · On-Device", "Docker", "AWS EC2"],
    hosting: {
      platform: "iPhone · iPad · Mac · Web",
      operatingSystem: "iOS, iPadOS, macOS, visionOS, Web",
      runsOn: "Docker on EC2",
      detail: {
        title: "Docker on EC2, in its own AWS account",
        body: "Every product runs in a separate account under one AWS organization, so a mistake in one has nothing to reach in another.",
      },
    },
    priceLabel: "$50/mo · $500/yr",
    priceUsdMonthly: 50,
    pricing:
      "$50 per month, or $500 per year (two months free). Live in production, with guided onboarding and an executive demo available before you commit.",
    faq: [
      {
        question: "Do I need a data warehouse or a data team?",
        answer:
          "No. Aegis reads the files you already keep: upload a workbook, or connect OneDrive or Google Sheets and it maps your columns and builds the dashboard from there.",
      },
      {
        question: "Does it stay up to date, or do I re-upload every month?",
        answer:
          "Connect the source and it keeps up. When a workbook lives in OneDrive or Google Sheets, Aegis reads it where it sits, so the dashboard reflects the file as your team maintains it rather than a snapshot from the last upload. One-off uploads still work if you prefer them.",
      },
      {
        question: "Can I use it on my phone?",
        answer:
          "Yes, and it was built for that. Aegis is on the App Store as a native app for iPhone, iPad and Mac, so the command center is available in the meeting rather than back at your desk. It also installs straight from the browser on Android, and the web version runs anywhere.",
      },
      {
        question: "What does the Glaukos AI analyst actually do?",
        answer:
          "Glaukos reads your live dashboard context, runs risk-first analysis, and returns plain-English briefings and recommendations. It's a human-in-the-loop design: it advises, you decide.",
      },
      {
        question: "Is my financial data safe?",
        answer:
          "Uploaded workbooks stay in your browser's on-device database: nothing you upload is written to the server, and the backend is a stateless calculator that persists nothing. Connecting OneDrive or Google Sheets authorizes Aegis to read that one file on your behalf, and you can revoke that access from your Microsoft or Google account whenever you like. AI features send data out only with your explicit consent.",
      },
      {
        question: "How do I get access?",
        answer:
          "The dashboard is open to explore with demo data right now, with no signup. When you want it running on your own numbers we onboard companies directly, including mapping your first workbook or connecting the file in OneDrive or Google Sheets. Reach out for a guided executive demo.",
      },
    ],
    links: [
      { href: "https://aegis.athenadatalabs.com", kind: "primary", umamiEvent: "open-aegis-products" },
      { href: "https://apps.apple.com/us/app/aegis-bi/id6787563318", kind: "appstore", umamiEvent: "aegis-appstore" },
      { href: "/contact", kind: "secondary", umamiEvent: "request-demo" },
    ],
    relatedServiceSlugs: ["dashboards", "forecasting", "ai-solutions"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center"],
    relatedFieldNoteSlugs: ["privacy-first-architecture-security", "executive-dashboard-design", "ai-agents-human-in-the-loop"],
  },
  {
    slug: "mybudgetnerd",
    name: "MyBudgetNerd",
    tag: "iOS · On the App Store",
    icon: "mybudgetnerd",
    tagline: "Personal Finance, Decoded",
    summary:
      "A shipped consumer finance product: PDF statement parsing, ML transaction categorization, and the Oracle engine for anomalies, category outlook, and plain-language explanation.",
    seoDescription:
      "A privacy-first budgeting app on the App Store: PDF statement parsing, ML categorization, and the Oracle engine for anomalies and plain-language explanation.",
    overview: [
      "MyBudgetNerd is a consumer finance product we designed, built, and shipped to the App Store, now a subscription SaaS with active subscribers. Upload a bank statement and it parses every transaction, categorizes them with a machine-learning pipeline, then hands the result to the Oracle: an analysis engine that flags anomalies, projects each category forward, and explains in plain language what changed since last month and why.",
      "It's privacy-first by architecture: statements are processed in memory, there's no requirement to hand over bank credentials, and every AI feature is opt-in. Oracle analysis is request-scoped and stored nowhere.",
    ],
    problem: [
      "Most budgeting apps demand direct bank-account logins and continuous data sharing, which is a dealbreaker for privacy-conscious users. And manual budgeting in a spreadsheet dies after two weeks of data entry.",
      "MyBudgetNerd takes the middle path: import the PDF statements you already have, let ML do the categorization and analysis, and keep full control over what's shared.",
    ],
    features: [
      { title: "PDF Statement Parsing", description: "Upload statements from your bank and every transaction is extracted automatically, no manual entry." },
      { title: "ML Categorization", description: "A machine-learning pipeline classifies transactions, learning from your corrections." },
      { title: "Oracle · Category Outlook", description: "Each spending category projected forward from your own history, so next month is a number rather than a surprise." },
      { title: "Oracle · Anomaly Detection", description: "Unusual transactions flagged statistically, so duplicate charges and cost drift get caught early." },
      { title: "Privacy-First · In-Memory", description: "No bank logins required. Statements processed in memory; you control what's shared." },
      { title: "Oracle · Financial Story", description: "A plain-language account of what moved this period and why, written from your own numbers. It explains; you decide." },
    ],
    technologies: ["React", "FastAPI", "Python", "scikit-learn", "Docker", "AWS EC2"],
    hosting: {
      platform: "iPhone · App Store",
      operatingSystem: "iOS",
      runsOn: "Docker on EC2",
      detail: {
        title: "Docker on EC2, in its own AWS account",
        body: "Every product runs in a separate account under one AWS organization, so a mistake in one has nothing to reach in another.",
      },
    },
    priceLabel: "$4.99/mo · $44.99/yr",
    priceUsdMonthly: 4.99,
    pricing:
      "$4.99 per month or $44.99 per year, on the App Store with active subscribers today.",
    faq: [
      {
        question: "Do I have to connect my bank account?",
        answer:
          "No, and that's the point. You import PDF statements you already have, so you never hand over bank credentials and you control exactly what data the app sees.",
      },
      {
        question: "How accurate is the automatic categorization?",
        answer:
          "The ML pipeline categorizes transactions automatically and learns from your corrections, so accuracy improves the more you use it.",
      },
      {
        question: "Is the AI required?",
        answer:
          "No. The Oracle and the optional AI categorization refinement are both opt-in; parsing, rule-based categorization, budgeting, and exports all work without them.",
      },
      {
        question: "What does it cost?",
        answer:
          "$4.99 a month or $44.99 a year, billed through the App Store. Parsing, rule-based categorization, budgeting, and exports all work without the optional AI features.",
      },
      {
        question: "What do users say?",
        answer:
          "MyBudgetNerd holds 5.0-star reviews on the App Store, with users specifically praising the clean design, PDF import, and privacy-conscious approach.",
      },
    ],
    links: [
      { href: "https://mybudgetnerd.com", kind: "primary", umamiEvent: "mbn-website" },
      { href: "https://apps.apple.com/us/app/mybudgetnerd/id6761061061", kind: "appstore", umamiEvent: "mbn-appstore" },
      { href: "/contact", kind: "secondary", umamiEvent: "mbn-contact" },
    ],
    relatedServiceSlugs: ["ai-solutions", "forecasting", "excel-automation"],
    relatedCaseStudySlugs: ["mybudgetnerd-ml-personal-finance"],
    relatedFieldNoteSlugs: ["privacy-first-architecture-security", "practical-forecasting-small-business"],
  },
  {
    slug: "thera",
    name: "Thera",
    tag: "In Production · Invitation Only",
    earlyAccess: true,
    icon: "thera",
    tagline: "Capture Intelligence for GovCon",
    provenance: {
      label: "Why Thera Exists",
      paragraphs: [
        "Thera was not a product idea looking for a market. It was a request. Cerberus Contracting LLC, a veteran-owned government contractor, needed a better answer than spreadsheets and gut feel to the question every small GovCon firm faces weekly: of the thousands of notices on SAM.gov, which handful are actually worth our time?",
        "We should be straight about the relationship, because you would find out anyway and it changes how you read the rest of this page. Cerberus is co-owned by our founder alongside two other veterans. It is a design partner, not an arm's-length customer, and nothing here should be read as an independent reference.",
        "What it is instead is a real operator with real money on the line. Cerberus runs its capture pipeline in Thera: live opportunities, real deadlines, real bid and no-bid decisions, and outcomes that show up in their revenue rather than in a metrics dashboard. Every feature below survived contact with people who lose work if the tool is wrong. That is a harder test than a customer interview, and it is the reason Thera scores opportunities instead of just listing them.",
        "It stays theirs alone for now, on purpose. Cerberus holds the design call on what ships next, and that only works while the feedback loop is one firm deep and the people using it will tell us when something is wrong. Thera opens up when that circle is ready to widen, not when a signup form is ready to collect names.",
      ],
    },
    summary:
      "An AI-native capture intelligence platform for government contractors, in production and running one firm's live pipeline. A Digital Twin of your company, explainable bid/no-bid scoring, AI opportunity briefings, and partner matching. Open by invitation.",
    seoDescription:
      "AI capture intelligence for government contractors: a Digital Twin of your company, explainable bid/no-bid scoring, and AI briefings on live SAM.gov notices.",
    overview: [
      "Thera helps government contractors decide what to pursue, how to pursue it, and how likely they are to win. It runs in production at thera.athenadatalabs.com, watching the federal opportunity stream (live SAM.gov notices, amendments, deadlines), maintaining a Digital Twin of your company, and scoring every opportunity against it with explainable reasoning, AI-generated executive briefings, and a pipeline that runs each pursuit from discovery to submission.",
      "It is open by invitation rather than by signup, and that is a deliberate choice about how it gets built. One contractor's pipeline runs on it today, and their bid decisions shape what ships next. Widening that circle before the product has earned it would trade a partner who tells us the truth for a queue of accounts nobody is watching closely.",
      "The learning loop runs per organization: your overrides and win/loss outcomes tune the recommendations inside your own boundary, and no customer's data is ever pooled with another's. One server, one database, encrypted backups: the same privacy-as-architecture discipline as the rest of our product line.",
    ],
    problem: [
      "Federal contracting teams drown in notices: thousands of postings, constant amendments, and a bid/no-bid call that usually comes down to gut feel under deadline pressure. Most procurement tools stop at search: they answer \"what contracts exist?\", not \"what should we pursue?\"",
      "Thera is built for the second question: given your capabilities, certifications, past performance, and capacity, which opportunities are worth pursuing, with whom, and with what probability of winning.",
    ],
    features: [
      { title: "Opportunity Discovery", description: "Continuous SAM.gov sync with amendment change tracking and deadline monitoring." },
      { title: "Digital Twin", description: "A living representation of your company: capabilities, certifications, past performance, capacity." },
      { title: "Explainable Scoring", description: "Bid/no-bid recommendations with visible reasoning: strategic fit, win probability, risk flags. Never a black box." },
      { title: "AI Opportunity Briefings", description: "Claude-generated executive briefs per opportunity: scope, risk factors, and recommended next actions." },
      { title: "Pipeline · Mission Control", description: "Run every pursuit from watchlist to submission with tasks, stages, and deadline awareness." },
      { title: "Partner Matching", description: "Teaming and subcontractor discovery ranked by capability, geography, and certification alignment." },
    ],
    technologies: ["Next.js", "FastAPI", "SQLite", "Anthropic Claude", "SAM.gov API", "USAspending.gov", "Docker"],
    hosting: {
      platform: "Web",
      operatingSystem: "Web",
      runsOn: "Docker on EC2",
      detail: {
        title: "Docker on EC2, in its own AWS account",
        body: "One server, one database, encrypted backups, and a separate AWS account from every other product. No customer's data is pooled with another's.",
      },
    },
    // Headline is what it costs today; the qualifier is what it will cost. The
    // band splits on " · ", so "Free for now" is the number a reader sees first.
    priceLabel: "Free for now · $200/mo at launch",
    priceUsdMonthly: 200,
    pricing:
      "$200 per month for one company profile, plus $100 per month for each additional profile, so a firm bidding under two entities pays $300. Free to use while Thera is invitation-only; billing switches on when it opens beyond its design partner. Ask for an invitation and you'll know the date before it does.",
    faq: [
      {
        question: "What is Thera?",
        answer:
          "Thera is an AI-native capture intelligence platform for government contractors: it finds federal opportunities, scores them against a Digital Twin of your company, and helps your team run the pursuit, with the reasoning behind every recommendation shown.",
      },
      {
        question: "Can I sign up?",
        answer:
          "Not yet, and not because it isn't ready. Thera runs in production at thera.athenadatalabs.com and has been carrying a contractor's live capture pipeline day to day. It is open by invitation while its design partner holds the call on what ships next. Ask for an invitation on this page and we'll come back to you when the circle widens.",
      },
      {
        question: "Is anyone actually using it?",
        answer:
          "Yes, and we'll be precise about who. Cerberus Contracting LLC, a veteran-owned government contractor co-owned by our founder, runs its capture pipeline in Thera. That makes them a design partner rather than an independent reference, which we'd rather say plainly than let you assume otherwise. The opportunities, deadlines, and bid decisions going through it are real.",
      },
      {
        question: "What does it cost?",
        answer:
          "Nothing while Thera is invitation-only. Pricing is set at $200 per month for one company profile plus $100 per month for each additional profile, and billing switches on when Thera opens beyond its design partner. Anyone using it before then hears the date from us first.",
      },
      {
        question: "How does the scoring work?",
        answer:
          "Every live notice is scored against your Digital Twin (capabilities, certifications, past performance, capacity), producing a strategic-fit score, a win probability, and risk flags, each with visible reasoning. Your overrides and win/loss outcomes tune the model for your organization alone.",
      },
      {
        question: "Where does my company data live?",
        answer:
          "In one place, on purpose: a single database on the application server, with encrypted auto-expiring backups and no third-party analytics. Your data is never pooled with another customer's. Read our privacy field note for the full architecture.",
      },
    ],
    links: [
      { href: "https://thera.athenadatalabs.com", kind: "primary", umamiEvent: "open-thera" },
      { label: "Request an Invitation", href: "#early-access", kind: "secondary", umamiEvent: "thera-notify" },
    ],
    relatedServiceSlugs: ["ai-solutions", "dashboards"],
    relatedCaseStudySlugs: [],
    relatedFieldNoteSlugs: ["privacy-first-architecture-security", "ai-agents-human-in-the-loop"],
  },
  {
    slug: "ann-studio",
    name: "ANN Builder Studio",
    tag: "Interactive · Live",
    icon: "ann",
    tagline: "Neural Networks, Hands-On",
    summary:
      "A hands-on neural-network workspace: explore and clean data, design and train models, then export predictions.",
    overview: [
      "ANN Builder Studio is a live, guided workspace for building neural networks without writing code. Upload a CSV, explore and clean the data, design the network layer by layer, train it, and export predictions, with interactive visuals at every step.",
      "We built it to make machine learning tangible: the same concepts that power our production forecasting systems, opened up so you can experiment with them directly.",
    ],
    problem: [
      "Machine learning stays abstract until you've built a model yourself, but the tooling assumes you already know Python, notebooks, and a dozen libraries.",
      "ANN Builder Studio removes that barrier: the full workflow from raw CSV to trained network to exported predictions, in a guided visual interface.",
    ],
    features: [
      { title: "Data Exploration", description: "Upload CSV data and review distributions, correlations, and quality before modeling." },
      { title: "Preprocessing Tools", description: "Handle missing values and duplicates with guided cleaning steps." },
      { title: "Visual Network Design", description: "Set hidden layers, neuron counts, and training parameters in a guided flow." },
      { title: "Training & Evaluation", description: "Train in the browser session, inspect performance, and iterate quickly." },
      { title: "Prediction Export", description: "Test the trained model on new data and export the results." },
    ],
    technologies: ["Python", "Streamlit", "scikit-learn", "Pandas"],
    hosting: {
      platform: "Web · Any browser",
      operatingSystem: "Web",
      runsOn: "Streamlit Community Cloud",
      detail: {
        title: "Streamlit Community Cloud",
        body: "A teaching tool, hosted where teaching tools belong: free, public, and disposable. Nothing you upload outlives the session.",
      },
    },
    priceLabel: "Free · Open source",
    pricing: "Free to use, with the source published on GitHub. Built as a teaching tool, not a product line.",
    faq: [
      {
        question: "Do I need to know how to code?",
        answer: "No. The entire workflow is a guided visual interface. It's designed for learning and rapid experimentation.",
      },
      {
        question: "Is it really free to use?",
        answer: "Yes, the live app is open, and the repository is public if you want to see how it's built.",
      },
      {
        question: "Can this handle production workloads?",
        answer:
          "It's an interactive studio for learning and prototyping. For production forecasting and ML systems, that's what our consulting engagements and Aegis BI are for.",
      },
    ],
    links: [
      { href: "https://ann-builder-app.streamlit.app", kind: "primary", umamiEvent: "open-ann" },
      { label: "View Repository", href: "https://github.com/Athena-Data-Labs/ANN_builder_app", kind: "secondary" },
    ],
    relatedServiceSlugs: ["operations-research", "forecasting"],
    relatedCaseStudySlugs: ["ann-studio-interactive-ml"],
    relatedFieldNoteSlugs: ["practical-forecasting-small-business"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
