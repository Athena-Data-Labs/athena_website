import type { Product } from "./types";

export const products: Product[] = [
  {
    slug: "aegis",
    name: "Aegis BI",
    tag: "Flagship · Closed Beta",
    icon: "aegis",
    tagline: "AI Financial Intelligence",
    summary:
      "AI-assisted financial intelligence — command-center dashboards, cash & revenue forecasting, what-if scenarios, and the Glaukos AI analyst.",
    overview: [
      "Aegis BI is our flagship business-intelligence platform, currently in closed beta ahead of its public SaaS and App Store launch. Upload a spreadsheet and Aegis maps the columns, builds a command-center dashboard, forecasts cash and revenue, runs what-if scenarios, and answers questions in plain English through Glaukos, its built-in AI analyst.",
      "It's designed to become a company's primary BI system — from board-level reporting to day-to-day operational execution — without requiring a data team to stand it up. Privacy-first by architecture: your data stays in your browser, and the backend is a stateless calculator that stores nothing.",
    ],
    problem: [
      "Small and mid-sized businesses run on spreadsheets: the numbers exist, but there's no live picture of cash, revenue trajectory, or risk. Traditional BI platforms assume a data warehouse and an analyst team most companies don't have.",
      "Aegis closes that gap: spreadsheet in, command center out. Forecasting, anomaly alerts, scenario modeling, and an AI analyst — with no pipeline project as a prerequisite.",
    ],
    features: [
      { title: "Command-Center Dashboard", description: "Live KPIs — revenue, expenses, net, coverage, margin, runway — with trend context and targets." },
      { title: "Cash & Revenue Forecasting", description: "Forward-looking projections with honest uncertainty, retrained as new data arrives." },
      { title: "What-If Scenarios", description: "Model hiring, pricing, and spend decisions and see the downstream impact instantly." },
      { title: "Signal Alerts", description: "Expense anomalies, client concentration, and risk flags surfaced automatically." },
      { title: "Glaukos · AI Analyst", description: "Ask your data in plain English — risk-first analysis, briefings, and recommendations with visible reasoning." },
      { title: "Spreadsheet-Native Onboarding", description: "Upload a workbook; Aegis maps columns and builds the dashboard — no ETL project required." },
    ],
    technologies: ["Python", "Dash (Plotly)", "FastAPI", "Pandas", "OpenAI API", "IndexedDB · On-Device"],
    pricing:
      "Currently in closed beta — early access and executive demos available on request. Public SaaS plans and an App Store release are on the roadmap.",
    faq: [
      {
        question: "Do I need a data warehouse or a data team?",
        answer:
          "No. Aegis is spreadsheet-native — upload a workbook and it maps your columns and builds the dashboard. As you grow, the same platform can ingest from other sources.",
      },
      {
        question: "What does the Glaukos AI analyst actually do?",
        answer:
          "Glaukos reads your live dashboard context, runs risk-first analysis, and returns plain-English briefings and recommendations. It's a human-in-the-loop design: it advises, you decide.",
      },
      {
        question: "Is my financial data safe?",
        answer:
          "Aegis keeps your data in your browser's on-device database — no upload is written to the server, and the backend is a stateless calculator that persists nothing. AI features send data out only with your explicit consent.",
      },
      {
        question: "How do I get access?",
        answer:
          "Aegis is in closed beta. The live dashboard is open to explore with demo data, and we onboard early-access users directly — reach out for a guided executive demo.",
      },
    ],
    links: [
      { label: "Open Live Dashboard", href: "https://aegis.athenadatalabs.com", kind: "primary", umamiEvent: "open-aegis-products" },
      { label: "Request Beta Access", href: "/contact", kind: "secondary", umamiEvent: "request-beta-access" },
    ],
    relatedServiceSlugs: ["dashboards", "forecasting", "ai-solutions"],
    relatedCaseStudySlugs: ["aegis-bi-financial-command-center"],
    relatedInsightSlugs: ["executive-dashboard-design", "ai-agents-human-in-the-loop"],
  },
  {
    slug: "mybudgetnerd",
    name: "MyBudgetNerd",
    tag: "iOS · On the App Store",
    icon: "mybudgetnerd",
    tagline: "Personal Finance, Decoded",
    summary:
      "A shipped consumer finance product — PDF statement parsing, ML transaction categorization, forecasting, and anomaly detection.",
    overview: [
      "MyBudgetNerd is a consumer finance product we designed, built, and shipped to the App Store, now a subscription SaaS with active subscribers. Upload a bank statement and it parses every transaction, categorizes them with a machine-learning pipeline, and surfaces anomaly detection, forecasting, and contextual recommendations.",
      "It's privacy-first by architecture: statements are processed in memory, there's no requirement to hand over bank credentials, and the AI features are optional.",
    ],
    problem: [
      "Most budgeting apps demand direct bank-account logins and continuous data sharing — a dealbreaker for privacy-conscious users. And manual budgeting in a spreadsheet dies after two weeks of data entry.",
      "MyBudgetNerd takes the middle path: import the PDF statements you already have, let ML do the categorization and analysis, and keep full control over what's shared.",
    ],
    features: [
      { title: "PDF Statement Parsing", description: "Upload statements from your bank — every transaction extracted automatically, no manual entry." },
      { title: "ML Categorization", description: "A machine-learning pipeline classifies transactions, learning from your corrections." },
      { title: "Forecasting & Trends", description: "Spending trajectory and category trends projected forward so surprises aren't surprises." },
      { title: "Anomaly Detection", description: "Unusual transactions flagged statistically — duplicate charges and cost drift caught early." },
      { title: "Privacy-First · In-Memory", description: "No bank logins required. Statements processed in memory; you control what's shared." },
      { title: "Optional AI Recommendations", description: "Context-aware guidance with human-in-the-loop control — on only if you want it." },
    ],
    technologies: ["React", "FastAPI", "Python", "scikit-learn", "AWS Amplify", "Elastic Beanstalk"],
    pricing: "Free to download on the App Store, with a Pro subscription for advanced features.",
    faq: [
      {
        question: "Do I have to connect my bank account?",
        answer:
          "No — that's the point. You import PDF statements you already have, so you never hand over bank credentials and you control exactly what data the app sees.",
      },
      {
        question: "How accurate is the automatic categorization?",
        answer:
          "The ML pipeline categorizes transactions automatically and learns from your corrections, so accuracy improves the more you use it.",
      },
      {
        question: "Is the AI required?",
        answer: "No. AI-powered recommendations are optional — the core budgeting, parsing, and analytics work without them.",
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
    relatedCaseStudySlugs: ["mybudgetnerd-ml-personal-finance"],
    relatedInsightSlugs: ["ai-agents-human-in-the-loop", "practical-forecasting-small-business"],
  },
  {
    slug: "ann-studio",
    name: "ANN Builder Studio",
    tag: "Interactive · Live",
    icon: "ann",
    tagline: "Neural Networks, Hands-On",
    summary:
      "A hands-on neural-network workspace — explore and clean data, design and train models, then export predictions.",
    overview: [
      "ANN Builder Studio is a live, guided workspace for building neural networks without writing code. Upload a CSV, explore and clean the data, design the network layer by layer, train it, and export predictions — with interactive visuals at every step.",
      "We built it to make machine learning tangible: the same concepts that power our production forecasting systems, opened up so you can experiment with them directly.",
    ],
    problem: [
      "Machine learning stays abstract until you've built a model yourself — but the tooling assumes you already know Python, notebooks, and a dozen libraries.",
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
        answer: "No — the entire workflow is a guided visual interface. It's designed for learning and rapid experimentation.",
      },
      {
        question: "Is it really free to use?",
        answer: "Yes, the live app is open — and the repository is public if you want to see how it's built.",
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
