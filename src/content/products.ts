import type { Product } from "./types";

export const products: Product[] = [
  {
    slug: "aegis",
    name: "Aegis BI",
    tag: "Flagship · In Production",
    icon: "aegis",
    tagline: "AI Financial Intelligence",
    summary:
      "AI-assisted financial intelligence: command-center dashboards, cash & revenue forecasting, what-if scenarios, and the Glaukos AI analyst.",
    overview: [
      "Aegis BI is our flagship business-intelligence platform, now live in production. Upload a spreadsheet and Aegis maps the columns, builds a command-center dashboard, forecasts cash and revenue, runs what-if scenarios, and answers questions in plain English through Glaukos, its built-in AI analyst.",
      "It's built to run as a company's primary BI system, from board reporting to daily operations, without a data team to stand it up. Privacy-first by architecture: your data stays in your browser, and the backend is a stateless calculator that stores nothing.",
    ],
    problem: [
      "Small and mid-sized businesses run on spreadsheets: the numbers exist, but there's no live picture of cash, revenue trajectory, or risk. Traditional BI platforms assume a data warehouse and an analyst team most companies don't have.",
      "Aegis closes that gap: spreadsheet in, command center out. Forecasting, anomaly alerts, scenario modeling, and an AI analyst, with no pipeline project as a prerequisite.",
    ],
    features: [
      { title: "Command-Center Dashboard", description: "Live KPIs (revenue, expenses, net, coverage, margin, runway) with trend context and targets." },
      { title: "Cash & Revenue Forecasting", description: "Forward-looking projections with honest uncertainty, retrained as new data arrives." },
      { title: "What-If Scenarios", description: "Model hiring, pricing, and spend decisions and see the downstream impact instantly." },
      { title: "Signal Alerts", description: "Expense anomalies, client concentration, and risk flags surfaced automatically." },
      { title: "Glaukos · AI Analyst", description: "Ask your data in plain English. Risk-first analysis, briefings, and recommendations with visible reasoning." },
      { title: "Spreadsheet-Native Onboarding", description: "Upload a workbook; Aegis maps columns and builds the dashboard. No ETL project required." },
    ],
    technologies: ["Python", "Dash (Plotly)", "FastAPI", "Pandas", "OpenAI API", "IndexedDB · On-Device"],
    pricing:
      "Live in production. Executive demos and onboarding available on request; public SaaS plans and an App Store release are on the roadmap.",
    faq: [
      {
        question: "Do I need a data warehouse or a data team?",
        answer:
          "No. Aegis is spreadsheet-native: upload a workbook and it maps your columns and builds the dashboard. As you grow, the same platform can ingest from other sources.",
      },
      {
        question: "What does the Glaukos AI analyst actually do?",
        answer:
          "Glaukos reads your live dashboard context, runs risk-first analysis, and returns plain-English briefings and recommendations. It's a human-in-the-loop design: it advises, you decide.",
      },
      {
        question: "Is my financial data safe?",
        answer:
          "Aegis keeps your data in your browser's on-device database. No upload is written to the server, and the backend is a stateless calculator that persists nothing. AI features send data out only with your explicit consent.",
      },
      {
        question: "How do I get access?",
        answer:
          "Aegis is live in production. The dashboard is open to explore with demo data, and we onboard new companies directly. Reach out for a guided executive demo.",
      },
    ],
    links: [
      { label: "Open Live Dashboard", href: "https://aegis.athenadatalabs.com", kind: "primary", umamiEvent: "open-aegis-products" },
      { label: "Request a Demo", href: "/contact", kind: "secondary", umamiEvent: "request-demo" },
    ],
    relatedServiceSlugs: ["dashboards", "forecasting", "ai-solutions"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center", "privacy-first-architecture-security"],
    relatedInsightSlugs: ["executive-dashboard-design", "ai-agents-human-in-the-loop"],
  },
  {
    slug: "mybudgetnerd",
    name: "MyBudgetNerd",
    tag: "iOS · On the App Store",
    icon: "mybudgetnerd",
    tagline: "Personal Finance, Decoded",
    summary:
      "A shipped consumer finance product: PDF statement parsing, ML transaction categorization, forecasting, and anomaly detection.",
    overview: [
      "MyBudgetNerd is a consumer finance product we designed, built, and shipped to the App Store, now a subscription SaaS with active subscribers. Upload a bank statement and it parses every transaction, categorizes them with a machine-learning pipeline, and surfaces anomaly detection, forecasting, and contextual recommendations.",
      "It's privacy-first by architecture: statements are processed in memory, there's no requirement to hand over bank credentials, and the AI features are optional.",
    ],
    problem: [
      "Most budgeting apps demand direct bank-account logins and continuous data sharing, which is a dealbreaker for privacy-conscious users. And manual budgeting in a spreadsheet dies after two weeks of data entry.",
      "MyBudgetNerd takes the middle path: import the PDF statements you already have, let ML do the categorization and analysis, and keep full control over what's shared.",
    ],
    features: [
      { title: "PDF Statement Parsing", description: "Upload statements from your bank and every transaction is extracted automatically, no manual entry." },
      { title: "ML Categorization", description: "A machine-learning pipeline classifies transactions, learning from your corrections." },
      { title: "Forecasting & Trends", description: "Spending trajectory and category trends projected forward so surprises aren't surprises." },
      { title: "Anomaly Detection", description: "Unusual transactions flagged statistically, so duplicate charges and cost drift get caught early." },
      { title: "Privacy-First · In-Memory", description: "No bank logins required. Statements processed in memory; you control what's shared." },
      { title: "Optional AI Recommendations", description: "Context-aware guidance with human-in-the-loop control, on only if you want it." },
    ],
    technologies: ["React", "FastAPI", "Python", "scikit-learn", "AWS Amplify", "Elastic Beanstalk"],
    pricing: "Free to download on the App Store, with a Pro subscription for advanced features.",
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
        answer: "No. AI-powered recommendations are optional; the core budgeting, parsing, and analytics work without them.",
      },
      {
        question: "What do users say?",
        answer:
          "MyBudgetNerd holds 5.0-star reviews on the App Store, with users specifically praising the clean design, PDF import, and privacy-conscious approach.",
      },
    ],
    links: [
      { label: "Download on the App Store", href: "https://apps.apple.com/us/app/mybudgetnerd/id6761061061", kind: "appstore", umamiEvent: "mbn-appstore" },
      { label: "Visit the Website", href: "https://mybudgetnerd.com", kind: "secondary", umamiEvent: "mbn-website" },
    ],
    relatedServiceSlugs: ["ai-solutions", "forecasting", "excel-automation"],
    relatedCaseStudySlugs: ["mybudgetnerd-ml-personal-finance", "privacy-first-architecture-security"],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop", "practical-forecasting-small-business"],
  },
  {
    slug: "thera",
    name: "Thera",
    tag: "In Development · Coming Soon",
    icon: "thera",
    tagline: "Capture Intelligence for GovCon",
    summary:
      "Our next product: an AI-native capture intelligence platform for government contractors. A Digital Twin of your company, explainable bid/no-bid scoring, AI opportunity briefings, and partner matching — currently in development.",
    overview: [
      "Thera helps government contractors decide what to pursue, how to pursue it, and how likely they are to win. It watches the federal opportunity stream — live SAM.gov notices, amendments, deadlines — maintains a Digital Twin of your company, and scores every opportunity against it with explainable reasoning, AI-generated executive briefings, and a pipeline that runs each pursuit from discovery to submission.",
      "The learning loop runs per organization: your overrides and win/loss outcomes tune the recommendations inside your own boundary, and no customer's data is ever pooled with another's. One server, one database, encrypted backups — the same privacy-as-architecture discipline as the rest of our product line.",
    ],
    problem: [
      "Federal contracting teams drown in notices: thousands of postings, constant amendments, and a bid/no-bid call that usually comes down to gut feel under deadline pressure. Most procurement tools stop at search — they answer \"what contracts exist?\", not \"what should we pursue?\"",
      "Thera is built for the second question: given your capabilities, certifications, past performance, and capacity, which opportunities are worth pursuing, with whom, and with what probability of winning.",
    ],
    features: [
      { title: "Opportunity Discovery", description: "Continuous SAM.gov sync with amendment change tracking and deadline monitoring." },
      { title: "Digital Twin", description: "A living representation of your company: capabilities, certifications, past performance, capacity." },
      { title: "Explainable Scoring", description: "Bid/no-bid recommendations with visible reasoning — strategic fit, win probability, risk flags. Never a black box." },
      { title: "AI Opportunity Briefings", description: "Claude-generated executive briefs per opportunity: scope, risk factors, and recommended next actions." },
      { title: "Pipeline · Mission Control", description: "Run every pursuit from watchlist to submission with tasks, stages, and deadline awareness." },
      { title: "Partner Matching", description: "Teaming and subcontractor discovery ranked by capability, geography, and certification alignment." },
    ],
    technologies: ["Next.js", "FastAPI", "SQLite", "Anthropic Claude", "SAM.gov API", "USAspending.gov", "Docker"],
    pricing:
      "In development. Planned at launch: a 14-day full trial, then straightforward per-company-profile subscription pricing. Join the launch list to get early access.",
    faq: [
      {
        question: "What is Thera?",
        answer:
          "Thera is an AI-native capture intelligence platform for government contractors: it finds federal opportunities, scores them against a Digital Twin of your company, and helps your team run the pursuit — with the reasoning behind every recommendation shown.",
      },
      {
        question: "When does it launch?",
        answer:
          "Thera is in active development. Reach out through the contact page to join the launch list and we'll notify you when early access opens.",
      },
      {
        question: "How does the scoring work?",
        answer:
          "Every live notice is scored against your Digital Twin — capabilities, certifications, past performance, capacity — producing a strategic-fit score, a win probability, and risk flags, each with visible reasoning. Your overrides and win/loss outcomes tune the model for your organization alone.",
      },
      {
        question: "Where does my company data live?",
        answer:
          "In one place, on purpose: a single database on the application server, with encrypted auto-expiring backups and no third-party analytics. Your data is never pooled with another customer's. Read our privacy case study for the full architecture.",
      },
    ],
    links: [{ label: "Get Notified at Launch", href: "/contact", kind: "primary", umamiEvent: "thera-notify" }],
    relatedServiceSlugs: ["ai-solutions", "dashboards"],
    relatedCaseStudySlugs: ["privacy-first-architecture-security"],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop"],
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
      { label: "Open Live App", href: "https://ann-builder-app.streamlit.app", kind: "primary", umamiEvent: "open-ann" },
      { label: "View Repository", href: "https://github.com/Athena-Data-Labs/ANN_builder_app", kind: "secondary" },
    ],
    relatedServiceSlugs: ["operations-research", "forecasting"],
    relatedCaseStudySlugs: ["ann-studio-interactive-ml"],
    relatedInsightSlugs: ["practical-forecasting-small-business"],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
