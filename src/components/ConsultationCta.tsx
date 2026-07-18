import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ConsultationCta = () => {
  const handleBookConsultation = () => {
    const subject = encodeURIComponent("Project Inquiry");
    const body = encodeURIComponent(
      "Hi Athena Data Labs, I'd like to discuss a project.\n\nCompany:\nTimeline:\nBudget range:\nProject goals:\n"
    );
    window.open(`mailto:info@athenadatalabs.com?subject=${subject}&body=${body}`, "_self");
  };

  // Transparent on pages that render NeuralBackdrop: the slim panel floats over the fixed plane
  return (
    <section className="relative z-10 border-b border-white/[0.06] bg-transparent py-12 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,9%)]"
        >
          {/* Panel context layer: dot grid held to the edges so the copy sits on a clean mid-plane */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-dot-grid-primary-sm [mask-image:radial-gradient(ellipse_65%_75%_at_50%_50%,transparent_45%,black)] opacity-50"
            aria-hidden="true"
          />
          {/* Top accent hairline anchoring the panel to the accent system */}
          <div className="absolute left-0 top-0 z-0 h-[2px] w-full bg-gradient-to-r from-primary/60 via-primary/15 to-transparent" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-7 p-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-9">
            <div className="max-w-2xl">
              <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                <span className="h-3 w-[2px] shrink-0 bg-primary" />
                Next Step
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Ready to Deliver Your Next <span className="text-gradient">Data Product</span>?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                Share your goals by email and we will respond with a practical next-step plan for scope, timeline, and delivery.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
              <Button
                variant="hero"
                onClick={handleBookConsultation}
                className="group"
                data-umami-event="project-inquiry"
              >
                Email Project Inquiry
                <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={16} />
              </Button>
              <Button variant="heroOutline" asChild>
                <Link to="/contact">Send a Message</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationCta;
