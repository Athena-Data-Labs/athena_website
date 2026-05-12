import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type FormData = z.infer<typeof contactSchema>;

const CtaSection = () => {
  const [form, setForm] = useState<FormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const subject = encodeURIComponent(`New inquiry from ${result.data.name}`);
    const body = encodeURIComponent(
      `Name: ${result.data.name}\nEmail: ${result.data.email}\n\n${result.data.message}`
    );
    window.open(`mailto:info@athenadatalabs.com?subject=${subject}&body=${body}`, "_self");
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto max-w-3xl rounded-2xl border border-border/50 card-gradient p-10 md:p-14 shadow-[var(--shadow-card)]"
        >
          <div className="text-center">
            <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Move from Data to
              <span className="text-gradient"> Confident Decisions</span>?
            </h2>
            <p className="mb-7 text-muted-foreground md:text-lg">
              Let's discuss how Athena Data Labs builds your business intelligence system:
              AI-driven dashboards, predictive modeling, and autonomous agents that turn data into action.
            </p>
          </div>

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
                Your mail client should have opened with your message. We'll get back to you soon.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
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
                    className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                  )}
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
                  className="w-full resize-none rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <Button variant="hero" size="lg" type="submit">
                  Book Strategy Call <Send className="ml-1" size={18} />
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
