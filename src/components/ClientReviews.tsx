import { motion } from "framer-motion";
import ReviewCard, { Stars } from "@/components/ReviewCard";
import { reviews, reviewSummary } from "@/content";

/**
 * What clients say about the studio, as opposed to about a product.
 *
 * Every other proof on this site is something we made and can therefore be
 * accused of framing. These are the one form of evidence we don't control, so
 * they run verbatim and at full length rather than clipped to a pull quote.
 */
const ClientReviews = () => (
  <section
    id="reviews"
    className="relative z-10 border-b border-white/[0.06] panel py-12 md:py-20"
  >
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mb-8 max-w-2xl md:mb-10"
      >
        <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
          <span className="h-3 w-[2px] shrink-0 bg-steel" />
          Client Reviews
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          The Part We Don&rsquo;t Write
        </h2>
        <div className="mt-3 h-px w-16 bg-steel/40" />
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Stars />
          <span className="font-mono text-xs tracking-[0.06em] text-steel/90">
            {reviewSummary.average.toFixed(1)} · {reviewSummary.count} Google reviews
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Everything else on this site is something we built and could be accused of framing
          favorably. These are not. They are left in public, under the reviewers&rsquo; own
          names, and printed here in full.
        </p>
      </motion.div>

      <div className="grid gap-px border border-white/[0.07] bg-white/[0.06] md:grid-cols-2">
        {reviews.map((review, i) => (
          <motion.div
            key={review.author}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex"
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ClientReviews;
