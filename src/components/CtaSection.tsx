import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm, ValidationError } from "@formspree/react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import { z } from "zod";
import { DUR, EASE } from "@/lib/motion";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type FormData = z.infer<typeof contactSchema>;

// Formspree form ID — the contact form posts here and Formspree forwards it to our inbox.
// This ID is public (it's the POST endpoint), so a hardcoded default is fine; an env var
// (VITE_FORMSPREE_ID) can override it per environment if ever needed.
const FORMSPREE_ID = (import.meta.env.VITE_FORMSPREE_ID as string | undefined) || "mjgqezlw";

const CtaSection = () => {
  const [form, setForm] = useState<FormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formspreeState, submitToFormspree] = useForm(FORMSPREE_ID);

  const submitted = formspreeState.succeeded;

  // Count a conversion in Umami only when the message actually sends, not on every click.
  useEffect(() => {
    if (formspreeState.succeeded) {
      window.umami?.track("contact-submit");
    }
  }, [formspreeState.succeeded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Formspree forwards the submission to our inbox. There is no mailto
    // fallback branch any more: FORMSPREE_ID carries a hardcoded default, so
    // the "no form configured" path could never run, and the dead branch was
    // also documented in .env.example as behaviour a visitor might see.
    void submitToFormspree(e);
  };

  return (
    <section id="contact" className="relative z-10 border-b border-foreground/[0.06] panel py-10 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: DUR.reveal, ease: EASE }}
          /* The single column below lg needs the same minmax(0,…) the two
             columns above lg already have. A grid track defaults to a
             min-content floor, so any one unbreakable thing inside the card —
             here the submit button — can shove the track wider than the
             viewport and take the whole page sideways with it. */
          className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-0 border border-foreground/[0.08] bg-surface lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
        >
          <div className="border-b border-foreground/[0.06] px-6 py-10 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
            <h2 className="mb-4 font-display text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
              Ready to Build <span className="text-gradient">Something Real?</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed md:text-lg md:leading-[1.7]">
              Tell us what you're working with and what you're trying to decide. We'll come back
              with a concrete first step: scope, timeline, and what we'd build first.
            </p>
            <p className="mt-6 border-l-2 border-steel/40 pl-4 text-sm text-muted-foreground">
              Prefer email?{" "}
              <a
                href="mailto:info@athenadatalabs.com"
                data-umami-event="project-inquiry"
                className="font-medium text-steel transition-colors hover:text-foreground"
              >
                info@athenadatalabs.com
              </a>
            </p>
          </div>

          <div className="px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: DUR.base, ease: EASE }}
              // The form is replaced rather than added to, so without a live
              // region the only feedback that the message sent is visual.
              role="status"
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <CheckCircle className="text-steel" size={48} aria-hidden="true" />
              <p className="text-lg font-semibold text-foreground">
                Thanks for reaching out!
              </p>
              <p className="text-sm text-muted-foreground">
                Your message has been sent. We&apos;ll get back to you shortly at the email you
                provided.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot: hidden from people, but bots fill it in — Formspree silently
                  discards any submission where this field is non-empty. */}
              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="w-full rounded-sm border border-foreground/[0.08] bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-steel/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  {errors.name && (
                    <p id="name-error" role="alert" className="mt-1 text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="w-full rounded-sm border border-foreground/[0.08] bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-steel/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" className="mt-1 text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                  <ValidationError prefix="Email" field="email" errors={formspreeState.errors} className="mt-1 text-xs text-destructive" />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  className="w-full resize-none rounded-sm border border-foreground/[0.08] bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-steel/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                {errors.message && (
                  <p id="message-error" role="alert" className="mt-1 text-xs text-destructive">
                    {errors.message}
                  </p>
                )}
                <ValidationError prefix="Message" field="message" errors={formspreeState.errors} className="mt-1 text-xs text-destructive" />
              </div>

              <ValidationError errors={formspreeState.errors} className="text-xs text-destructive" />

              {/* Full width on phones: at 390px the uppercase label plus lg
                  padding is wider than the card, and a nowrap button in an auto
                  grid track drags the whole column past the viewport.

                  That fixed 390 and left 320 broken, which is the width WCAG
                  1.4.10 actually names: "BOOK STRATEGY CALL" set uppercase at
                  0.12em is 314px of unbreakable line in a 267px card, so the
                  homepage and this page both scrolled sideways on a 320px
                  phone — an SE, a Fold's outer screen, or anyone at 150% zoom.
                  The button variant hard-codes `whitespace-nowrap`, so the
                  override has to be important to beat it; below sm the label
                  is allowed to take two lines and the button grows to suit,
                  which is why the height goes auto with a floor rather than
                  staying pinned at h-11. */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="hero"
                  size="lg"
                  type="submit"
                  disabled={formspreeState.submitting}
                  className="h-auto min-h-11 w-full min-w-0 !whitespace-normal px-4 py-3 leading-tight sm:h-11 sm:w-auto sm:!whitespace-nowrap sm:px-8 sm:py-0"
                >
                  {formspreeState.submitting ? "Sending…" : "Book Strategy Call"} <Send className="ml-1" size={18} />
                </Button>
              </div>
            </form>
          )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
