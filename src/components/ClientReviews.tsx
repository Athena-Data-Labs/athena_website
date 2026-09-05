import { motion } from "framer-motion";
import ReviewCard, { SourceLabel, Stars } from "@/components/ReviewCard";
import { writtenReviews, silentRatings, reviewSummary } from "@/content";
import { DUR, EASE } from "@/lib/motion";

/**
 * The ratings that came with no text, named individually.
 *
 * It occupies the cell a fifth review leaves empty in a two-column grid, which is
 * the small reason for it. The real one is that these ratings count toward the
 * average printed at the top of this section, and a reader is entitled to see
 * what they are counting rather than take a total on trust.
 */
const SilentRatings = () => (
  <div className="flex h-full w-full flex-col bg-background p-7 md:p-8">
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
      Rated, Nothing Written
    </p>
    <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
      {silentRatings.length === 1 ? "One more rating" : `${silentRatings.length} more ratings`}{" "}
      counted in the average above, with nothing written. Named, so the total is checkable.
    </p>

    <ul className="mt-6 flex flex-col gap-4 border-t border-foreground/[0.07] pt-4">
      {silentRatings.map((rating) => (
        <li key={`${rating.source}-${rating.author}`}>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Stars />
            <span className="text-sm font-semibold text-foreground">{rating.author}</span>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/40">
            <SourceLabel review={rating} />
            {[rating.product?.name, rating.dateLabel]
              .filter(Boolean)
              .map((part) => ` · ${part}`)
              .join("")}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Every review anyone has left us, printed at full length.
 *
 * This is the page the homepage rail points at, and the reason that rail is
 * allowed to quote one sentence each: the whole text lives here, unedited, so an
 * excerpt is a summary of something a reader can go and check rather than a
 * substitute for it. About is the right home for it — someone who has scrolled
 * this far has already decided to read.
 *
 * Two sources on purpose, and named on each card rather than merged. Clients
 * reviewing the studio and strangers reviewing a shipped app are different
 * claims — one says we are good to hire, the other says the work is good on its
 * own, from people with no relationship to trade on. Presented as one
 * undifferentiated block of five stars it would read as the weaker of the two;
 * labelled, the second is the harder evidence.
 */
const ClientReviews = () => (
  <section
    id="reviews"
    className="relative z-10 border-b border-foreground/[0.06] panel py-12 md:py-20"
  >
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: DUR.reveal, ease: EASE }}
        className="mb-8 max-w-2xl md:mb-10"
      >
        <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/55">
          <span className="h-3 w-[2px] shrink-0 bg-steel" />
          Reviews
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          The Part We Don&rsquo;t Write
        </h2>
        <div className="mt-3 h-px w-16 bg-steel/40" />
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Stars />
          <span className="font-mono text-xs tracking-[0.06em] text-steel">
            {reviewSummary.average.toFixed(1)} · {reviewSummary.ratingCount} ratings
          </span>
        </div>
        {/* One paragraph, because the earlier three said the same thing three
            ways: the chip broke the sources down, then a sentence broke the same
            sources down again in prose, then a third counted how many wrote
            something. The cards below already name their own sources, so the copy
            only has to make the claim and say where the missing two went. */}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Everything else on this site is something we built and could be accused of framing
          favorably. These are not: {reviewSummary.clientCount} came from clients who hired
          the studio, {reviewSummary.appStoreCount} from strangers paying for MyBudgetNerd,{" "}
          {reviewSummary.peerPushCount} from other makers on PeerPush. The{" "}
          {reviewSummary.writtenCount} who wrote something are below, in full and unedited.
        </p>
      </motion.div>

      <div className="grid gap-px border border-foreground/[0.07] bg-foreground/[0.06] md:grid-cols-2">
        {writtenReviews.map((review, i) => (
          <motion.div
            key={review.author}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: DUR.reveal, delay: i * 0.08, ease: EASE }}
            className="flex"
          >
            <ReviewCard review={review} showProduct />
          </motion.div>
        ))}

        {silentRatings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: DUR.reveal,
              delay: writtenReviews.length * 0.08,
              ease: EASE,
            }}
            className="flex"
          >
            <SilentRatings />
          </motion.div>
        )}
      </div>
    </div>
  </section>
);

export default ClientReviews;
