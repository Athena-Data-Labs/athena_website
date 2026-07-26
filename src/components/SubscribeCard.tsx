import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm, ValidationError } from "@formspree/react";
import { ArrowRight, CheckCircle } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

// Same Formspree account as the contact form; a hidden `_subject` separates the
// two in the inbox. Overridable per environment if the list ever moves to its
// own form or a real ESP.
const FORMSPREE_ID =
  (import.meta.env.VITE_FORMSPREE_NOTES_ID as string | undefined) ||
  (import.meta.env.VITE_FORMSPREE_ID as string | undefined) ||
  "mjgqezlw";

type SubscribeCardProps = {
  /** Small uppercase label above the heading */
  eyebrow?: string;
  heading: string;
  description: string;
  /** Line under the field — set expectations before someone commits an address */
  note?: string;
  /** Subject line Formspree stamps on the email, so signups are filterable */
  subject: string;
  /** Umami conversion event fired on a successful submit */
  umamiEvent: string;
  buttonLabel?: string;
};

/**
 * The low-commitment rung of the CTA ladder. Everything else on this site asks
 * for a call; most visitors are not ready for one, and an email address is the
 * only thing worth asking of them instead.
 *
 * Steel, not gold: gold marks the primary ask, and this is deliberately the
 * smaller one.
 */
const SubscribeCard = ({
  eyebrow = "Stay Close to the Work",
  heading,
  description,
  note,
  subject,
  umamiEvent,
  buttonLabel = "Subscribe",
}: SubscribeCardProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [state, submit] = useForm(FORMSPREE_ID);

  useEffect(() => {
    if (state.succeeded) window.umami?.track(umamiEvent);
  }, [state.succeeded, umamiEvent]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }
    setError(undefined);
    void submit(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="border border-white/[0.08] bg-[hsl(213,38%,9%)] px-7 py-8 md:px-9 md:py-10"
    >
      {state.succeeded ? (
        <div className="flex flex-col items-start gap-3">
          <CheckCircle className="text-steel" size={32} />
          <p className="font-display text-lg font-semibold text-foreground">You&apos;re on the list.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ll email you when the next one publishes. No cadence promises we can&apos;t keep,
            and one click unsubscribes.
          </p>
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-center md:gap-10">
          <div>
            <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-steel" />
              {eyebrow}
            </p>
            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground">
              {heading}
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-[1.7] text-muted-foreground">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            {/* Honeypot: bots fill it, Formspree discards those submissions. */}
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <input type="hidden" name="_subject" value={subject} />

            <label htmlFor={`subscribe-${umamiEvent}`} className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id={`subscribe-${umamiEvent}`}
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="you@company.com"
                className="w-full rounded-sm border border-white/[0.08] bg-[hsl(213,34%,7%)] px-4 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-steel/50 focus:outline-none focus:ring-1 focus:ring-steel/30"
              />
              <button
                type="submit"
                disabled={state.submitting}
                className="inline-flex shrink-0 items-center justify-center gap-2 border border-steel/45 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-steel transition-colors hover:bg-steel/10 disabled:opacity-60"
              >
                {state.submitting ? "Sending…" : buttonLabel}
                <ArrowRight size={14} />
              </button>
            </div>

            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-2 text-xs text-destructive" />
            {note && <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">{note}</p>}
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default SubscribeCard;
