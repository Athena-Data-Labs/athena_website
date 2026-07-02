import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BrainCircuit, ScanSearch, ShieldCheck, Star, TrendingUp } from "lucide-react";
import myBudgetNerdIcon from "@/assets/mybudgetnerd-icon.webp";
import appStoreBadge from "@/assets/download-on-the-app-store-en-us/white.svg";
import MbnScreens from "@/components/MbnScreens";

const features = [
  { icon: ScanSearch, label: "PDF Statement Parsing" },
  { icon: BrainCircuit, label: "ML Categorization" },
  { icon: TrendingUp, label: "Forecasting & Trends" },
  { icon: AlertTriangle, label: "Anomaly Detection" },
  { icon: ShieldCheck, label: "Privacy-First · In-Memory" },
];

const reviews = [
  {
    title: "Pro Subscriber Review",
    quote:
      "I've really enjoyed using MyBudgetNerd. The design is clean and modern, and the interface is intuitive, making it easy to track spending and stay on top of my budget. It's simple to use while still offering the features I need to manage my finances effectively.",
    author: "Buraz Mickey",
    meta: "App Store · United States",
  },
  {
    title: "Easy to Use and Gives You Full Control",
    quote:
      "This app is incredibly easy to use and works seamlessly with several of my banks. One of my favorite features is that it doesn't require me to log directly into my bank accounts — I can import data from PDFs instead. The interface is intuitive and gives me complete control over what information I choose to share. I also like that the AI features are optional, which is great for users who may be hesitant about AI. Overall, it's a well-designed, flexible, and privacy-conscious app that I highly recommend.",
    author: "To-Lam",
    meta: "App Store · United States",
  },
];

const Stars = () => (
  <span className="flex items-center gap-0.5 text-primary" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={13} className="fill-primary text-primary" />
    ))}
  </span>
);

/** MyBudgetNerd hero showcase — full marketing block with screens, reviews, and store links. */
const ProductSection = () => {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#0a0c10]">

      <div className="container relative z-10 mx-auto px-6 py-12 md:py-20">
        <div className="grid min-h-[650px] grid-cols-1 items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative z-20 flex flex-col justify-center border border-white/[0.08] bg-[hsl(213,38%,9%)] px-8 py-10 lg:px-10 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={myBudgetNerdIcon}
                  alt="MyBudgetNerd app icon"
                  className="h-16 w-16 shrink-0 object-contain"
                  loading="lazy"
                />
                <div>
                  <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <span className="h-1 w-1 rounded-full bg-primary" /> iOS · On the App Store
                  </p>
                  <p className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                    MyBudgetNerd
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-5 font-display text-5xl font-bold leading-[1.06] tracking-tight text-white md:text-6xl lg:text-7xl lg:mr-[-5rem] relative z-30"
            >
              Personal Finance,
              <span className="text-gradient"> Decoded</span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.28, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-5 mb-4 h-px w-20 origin-left bg-primary/40"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="max-w-[56ch] text-base leading-[1.75] text-muted-foreground md:text-lg md:leading-[1.8]"
            >
              MyBudgetNerd is a consumer finance product we designed, built, and shipped to the App
              Store. Upload a bank statement and it parses every transaction, categorizes them with a
              machine-learning pipeline, and surfaces{" "}
              <span className="text-primary font-medium">anomaly detection</span>,{" "}
              <span className="text-primary font-medium">forecasting</span>, and{" "}
              <span className="text-primary font-medium">contextual recommendations</span>.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-3 max-w-[56ch] text-sm leading-[1.7] text-muted-foreground/60"
            >
              Built with React + FastAPI, deployed on AWS (Amplify + Elastic Beanstalk),
              with optional human-in-the-loop AI recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] as const }}
              className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
            >
              {features.map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"
                >
                  <f.icon size={14} className="text-primary" />
                  {f.label}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-7"
            >
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://apps.apple.com/us/app/mybudgetnerd/id6761061061"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-umami-event="mbn-appstore"
                  aria-label="Download MyBudgetNerd on the App Store"
                  className="inline-flex transition-opacity hover:opacity-80"
                >
                  <img src={appStoreBadge} alt="Download on the App Store" className="h-[52px] w-auto" />
                </a>

                <a
                  href="https://mybudgetnerd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-umami-event="mbn-website"
                  className="inline-flex items-center gap-2 border border-white/10 bg-transparent px-6 py-[15px] text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-primary/40"
                >
                  Visit the Website <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="relative flex items-stretch justify-center border border-l-0 border-white/[0.08] bg-[hsl(213,42%,6%)] lg:rounded-l-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative flex w-full flex-col justify-center p-6"
            >
              <div className="mb-6 flex items-center justify-center border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-primary/70">App Store · iPhone</p>
              </div>
              <MbnScreens />
            </motion.div>
          </div>
        </div>

        {/* App Store reviews — text testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-12 md:mt-14 border-t border-white/[0.06] pt-10 md:pt-12"
        >
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
              From the App Store
            </span>
            <Stars />
            <span className="text-xs text-muted-foreground">5.0 · Verified reviews</span>
          </div>

          <div className="grid gap-px border border-white/[0.07] bg-white/[0.05] md:grid-cols-2">
            {reviews.map((r) => (
              <figure key={r.author} className="flex h-full flex-col bg-[#0a0c10] p-7">
                <Stars />
                <figcaption className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                  {r.title}
                </figcaption>
                <blockquote className="mt-3 flex-1 text-sm leading-[1.7] text-muted-foreground">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-xs font-medium text-foreground">
                  {r.author} <span className="text-muted-foreground/60">— {r.meta}</span>
                </p>
              </figure>
            ))}
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default ProductSection;
