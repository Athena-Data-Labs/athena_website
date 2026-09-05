import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { Review } from "@/content";

/** Five filled stars. Every review we publish is a five, so it takes no rating. */
export const Stars = () => (
  <span className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={13} className="fill-primary text-primary" />
    ))}
  </span>
);

/**
 * Where a rating was left, linked when the name is not its own credential.
 *
 * Google and the App Store need no introduction. A maker directory does, and the
 * label is already on the card — making it the link answers "what is that?" for
 * no extra space. Shared so that one rule decides it everywhere it appears.
 */
export const SourceLabel = ({ review }: { review: Review }) =>
  review.sourceUrl ? (
    <a
      href={review.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:text-steel"
    >
      {review.source}
    </a>
  ) : (
    <>{review.source}</>
  );

/**
 * One review, in the single shape reviews take across this site.
 *
 * Company reviews and App Store reviews used to be laid out by two different
 * components that had drifted apart — different card background, different
 * attribution order, a rule under one and not the other. They are the same kind
 * of evidence, so they get the same card; only the optional headline differs.
 *
 * `showProduct` is for the mixed rail on the homepage and About, where what was
 * reviewed is the only thing separating a client's review from a stranger's, and
 * where the reader has somewhere to go with it. A product page leaves it off:
 * there, the product is both already obvious and a link to the page you are on.
 *
 * The homepage does not use this card at all — see ReviewRail, which shows one
 * sentence each. This is the full-length rendering, for the pages where the
 * whole review is the point.
 */
const ReviewCard = ({
  review,
  showProduct = false,
}: {
  review: Review;
  showProduct?: boolean;
}) => (
  <figure className="flex h-full w-full flex-col bg-background p-7 md:p-8">
    <Stars />

    {review.title && (
      <figcaption className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
        {review.title}
      </figcaption>
    )}

    {/* Guarded because `quote` is optional now: a rating with nothing written
        would otherwise render a card containing a pair of empty quote marks. */}
    {review.quote && (
      <blockquote className="mt-4 flex-1 text-sm leading-[1.75] text-muted-foreground">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
    )}

    <div className="mt-6 border-t border-foreground/[0.07] pt-4">
      <p className="text-sm font-semibold text-foreground">
        {review.author}
        {review.org && (
          <span className="font-normal text-muted-foreground">
            {" · "}
            {review.role && `${review.role}, `}
            {review.orgUrl ? (
              <a
                href={review.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-foreground/20 underline-offset-2 transition-colors hover:text-steel"
              >
                {review.org}
              </a>
            ) : (
              review.org
            )}
          </span>
        )}
      </p>
      {/* Source first, then what was reviewed, then when and who. Read in that
          order it answers "can I check this?" before "should I believe it?". */}
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-meta-quiet">
        <SourceLabel review={review} />
        {review.product && showProduct && (
          <>
            {" · "}
            <Link
              to={`/products/${review.product.slug}`}
              className="text-meta underline decoration-foreground/20 underline-offset-2 transition-colors hover:text-steel"
            >
              {review.product.name}
            </Link>
          </>
        )}
        {[review.dateLabel, review.credential]
          .filter(Boolean)
          .map((part) => ` · ${part}`)
          .join("")}
      </p>
    </div>
  </figure>
);

export default ReviewCard;
