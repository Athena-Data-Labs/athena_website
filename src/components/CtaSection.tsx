import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm, ValidationError } from "@formspree/react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import { z } from "zod";

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
  const [mailtoSent, setMailtoSent] = useState(false);
  const [formspreeState, submitToFormspree] = useForm(FORMSPREE_ID);

  const submitted = formspreeState.succeeded || mailtoSent;

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

    if (FORMSPREE_ID) {
      // Send to Formspree, which forwards the submission to our inbox.
      void submitToFormspree(e);
      return;
    }

    // Fallback: no Formspree form configured yet — open the visitor's mail client.
    const subject = encodeURIComponent(`New inquiry from ${result.data.name}`);
    const body = encodeURIComponent(
      `Name: ${result.data.name}\nEmail: ${result.data.email}\n\n${result.data.message}`
    );
    window.open(`mailto:info@athenadatalabs.com?subject=${subject}&body=${body}`, "_self");
    setMailtoSent(true);
  };

  return (
    <section id="contact" className="relative border-b border-white/[0.06] py-12 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const }}
          className="mx-auto grid max-w-5xl gap-0 border border-white/[0.08] bg-[hsl(213,38%,9%)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
        >
          <div className="border-b border-white/[0.06] px-8 py-10 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
            <h2 className="mb-4 font-display text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
              Ready to Move from Data to <span className="text-gradient">Confident Decisions?</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed md:text-lg md:leading-[1.7]">
              Let's discuss how Athena Data Labs builds your business intelligence system:
              AI-driven dashboards, predictive modeling, and autonomous agents that turn data into action.
            </p>
            <p className="mt-6 border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">
              Prefer email?{" "}
              <a
                href="mailto:info@athenadatalabs.com"
                data-umami-event="project-inquiry"
                className="font-medium text-primary transition-colors hover:text-primary/80"
              >
                info@athenadatalabs.com
              </a>
            </p>
          </div>

          <div className="px-8 py-10 lg:px-10 lg:py-12">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <CheckCircle className="text-primary" size={48} />
              <p className="text-lg font-semibold text-foreground">
                Thanks for reaching out!
              </p>
              <p className="text-sm text-muted-foreground">
                {FORMSPREE_ID
                  ? "Your message has been sent — we'll get back to you shortly at the email you provided."
                  : "Your mail client should have opened with your message. We'll get back to you soon."}
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
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-sm border border-white/[0.08] bg-[hsl(213,34%,9%)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name}</p>
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
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-sm border border-white/[0.08] bg-[hsl(213,34%,9%)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
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
                  className="w-full resize-none rounded-sm border border-white/[0.08] bg-[hsl(213,34%,9%)] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
                <ValidationError prefix="Message" field="message" errors={formspreeState.errors} className="mt-1 text-xs text-destructive" />
              </div>

              <ValidationError errors={formspreeState.errors} className="text-xs text-destructive" />

              <div className="flex justify-center pt-2">
                <Button variant="hero" size="lg" type="submit" disabled={formspreeState.submitting}>
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
