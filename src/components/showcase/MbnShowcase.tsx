import { motion } from "framer-motion";
import { Star } from "lucide-react";
import MbnScreens from "@/components/MbnScreens";

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
  <span className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={13} className="fill-primary text-primary" />
    ))}
  </span>
);

/**
 * MyBudgetNerd demo: the shipped screens next to what users said about them.
 *
 * The product's name, tagline, pitch and App Store badge used to live here in a
 * second full hero; they are the page hero now. Screens and reviews are the two
 * things nothing else on the page can show.
 */
const MbnShowcase = () => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
        <span className="h-3 w-[2px] shrink-0 bg-steel" />
        Shipped on iPhone
      </p>
      <Stars />
      <span className="text-xs text-muted-foreground">5.0 on the App Store · Verified reviews</span>
    </div>

    <div className="grid gap-px border border-white/[0.07] bg-white/[0.06] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="flex items-center justify-center bg-[hsl(213,42%,6%)] p-7">
        <MbnScreens />
      </div>

      <div className="grid gap-px bg-white/[0.06]">
        {reviews.map((r) => (
          <figure key={r.author} className="flex flex-col justify-center bg-[hsl(213,38%,9%)] p-7 md:p-8">
            <Stars />
            <figcaption className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
              {r.title}
            </figcaption>
            <blockquote className="mt-3 text-sm leading-[1.75] text-muted-foreground">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <p className="mt-5 text-xs font-medium text-foreground">
              {r.author} <span className="text-muted-foreground/60">· {r.meta}</span>
            </p>
          </figure>
        ))}
      </div>
    </div>
  </motion.div>
);

export default MbnShowcase;
