import { motion } from "framer-motion";
import MbnScreens from "@/components/MbnScreens";
import ReviewCard, { Stars } from "@/components/ReviewCard";
import { appStoreReviews } from "@/content";

/**
 * MyBudgetNerd demo: the shipped screens next to what users said about them.
 *
 * The product's name, tagline, pitch and App Store badge used to live here in a
 * second full hero; they are the page hero now. Screens and reviews are the two
 * things nothing else on the page can show.
 *
 * Header row, hairline grid and the 01/02/03 strip match the other three
 * showcases — a reader moving between product pages should recognize the
 * furniture and only have to read what's different.
 */
const MbnShowcase = () => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        <span className="h-3 w-[2px] shrink-0 bg-steel" />
        Shipped on iPhone · Real Screens
      </p>
      <span className="flex items-center gap-2.5">
        <Stars />
        <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">
          5.0 on the App Store · Verified reviews
        </span>
      </span>
    </div>

    <div className="grid gap-px border border-white/[0.07] bg-white/[0.06] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="flex items-center justify-center bg-[hsl(213,42%,6%)] p-7">
        <MbnScreens />
      </div>

      <div className="grid gap-px bg-white/[0.06]">
        {appStoreReviews.map((review) => (
          <ReviewCard key={review.author} review={review} />
        ))}
      </div>
    </div>

    {/* The engine underneath the screens, in the same three beats the Aegis and
        Thera showcases use: what goes in, what it works out, what you get. */}
    <div className="mt-8 grid gap-px border border-white/[0.07] bg-white/[0.06] md:grid-cols-3">
      {[
        {
          step: "01",
          title: "Import",
          body: "PDF statements you already have, parsed transaction by transaction. No bank logins, no credentials handed over.",
        },
        {
          step: "02",
          title: "Categorize",
          body: "A machine-learning pipeline classifies every transaction and learns from the corrections you make.",
        },
        {
          step: "03",
          title: "Explain",
          body: "The Oracle projects each category forward, flags anomalies, and says in plain language what changed and why.",
        },
      ].map((cell) => (
        <div key={cell.step} className="bg-[#0a0c10] p-6 md:p-7">
          <span className="font-mono text-[10px] tracking-[0.16em] text-white/20">{cell.step}</span>
          <p className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
            {cell.title}
          </p>
          <p className="mt-2 text-sm leading-[1.65] text-muted-foreground">{cell.body}</p>
        </div>
      ))}
    </div>
  </motion.div>
);

export default MbnShowcase;
