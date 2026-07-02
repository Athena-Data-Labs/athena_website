import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";

const ConsultationCta = () => {
  const handleBookConsultation = () => {
    const subject = encodeURIComponent("Project Inquiry");
    const body = encodeURIComponent(
      "Hi Athena Data Labs, I'd like to discuss a project.\n\nCompany:\nTimeline:\nBudget range:\nProject goals:\n"
    );
    window.open(`mailto:info@athenadatalabs.com?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <section className="relative border-b border-white/[0.06] py-12 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative overflow-hidden border border-white/[0.08] bg-[hsl(213,38%,9%)] p-10 md:p-14"
        >
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-5"
            >
              <div className="mb-4 inline-flex text-primary">
                <Calendar size={32} />
              </div>
              <h2 className="mb-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Ready to Deliver Your Next{" "}
                <span className="text-gradient">Data Product</span>?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Share your goals by email and we will respond with a practical next-step plan for scope, timeline, and delivery.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                variant="hero"
                size="lg"
                onClick={handleBookConsultation}
                className="group"
                data-umami-event="project-inquiry"
              >
                Email Project Inquiry
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <Link to="/contact">Send a Message</Link>
              </Button>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsultationCta;
