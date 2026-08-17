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
 * One review, in the single shape reviews take across this site.
 *
 * Company reviews and App Store reviews used to be laid out by two different
 * components that had drifted apart — different card background, different
 * attribution order, a rule under one and not the other. They are the same kind
 * of evidence, so they get the same card; only the optional headline differs.
 */
const ReviewCard = ({ review }: { review: Review }) => (
  <figure className="flex h-full w-full flex-col bg-background p-7 md:p-8">
    <Stars />

    {review.title && (
      <figcaption className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
        {review.title}
      </figcaption>
    )}

    <blockquote className="mt-4 flex-1 text-sm leading-[1.75] text-muted-foreground">
      &ldquo;{review.quote}&rdquo;
    </blockquote>

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
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/40">
        {[review.source, review.dateLabel, review.credential].filter(Boolean).join(" · ")}
      </p>
    </div>
  </figure>
);

export default ReviewCard;
