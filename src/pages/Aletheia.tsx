import { motion } from "framer-motion";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import NeuralBackdrop from "@/components/NeuralBackdrop";
import Footer from "@/components/Footer";

const charterLead = [
  "Technology is one of humanity's greatest tools.",
  "When guided by wisdom, integrity, and purpose, it can expand opportunity, strengthen communities, and improve lives.",
  "At Athena Data Labs, we believe technology exists to serve people, not the other way around.",
  "We measure success not by the complexity of what we build, but by the value it creates for those we serve.",
];

const charterCore = [
  "Our mission is to build intelligent software and data solutions that transform complexity into clarity.",
  "Through thoughtful engineering, privacy first design, and responsible use of artificial intelligence, we empower individuals, organizations, and communities to make informed decisions with confidence.",
  "Our vision is a future where trustworthy technology is accessible to everyone, where data illuminates rather than overwhelms, where artificial intelligence enhances human judgment rather than replacing it, and where innovation is always grounded in ethics, transparency, and service.",
];

const beliefs = [
  "Truth is discovered through evidence, not assumption.",
  "Privacy is a fundamental right.",
  "Innovation should always have purpose.",
  "Technology should empower, not control.",
  "Service is more important than self.",
  "Craftsmanship matters.",
  "Learning is a lifelong pursuit.",
];

const charterClose = [
  "Our promise is to build technology that is intelligent without being intrusive, powerful without unnecessary complexity, and designed to serve people first.",
  "Named for my daughter Athena, and inspired by the timeless ideal of wisdom, Athena Data Labs exists to build more than software; we aspire to build a legacy.",
];

const revealTransition = {
  duration: 0.65,
  ease: [0.21, 0.47, 0.32, 0.98] as const,
};

const Aletheia = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Aletheia - Athena Charter"
        description="The Athena Charter: Aletheia, truth revealed through data. Our manifesto on evidence, privacy, service, and innovation with purpose."
        path="/aletheia"
        image="/og/aletheia.png"
        imageAlt="Aletheia — the Athena Data Labs manifesto"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Aletheia — The Athena Charter",
          description:
            "The Athena Charter: Aletheia, truth revealed through data. A manifesto on evidence, privacy, service, and innovation with purpose.",
          url: "https://athenadatalabs.com/aletheia",
          publisher: { "@type": "Organization", name: "Athena Data Labs", url: "https://athenadatalabs.com" },
        }}
      />

      <Navbar />

      {/* The manifesto reads as one continuous window onto the fixed plane */}
      <NeuralBackdrop />
      <main className="relative z-10 border-b border-white/[0.06] bg-transparent pt-28 pb-16 md:pt-32 md:pb-24">
        <article className="container mx-auto max-w-5xl px-6">
          <motion.header
            initial={{ opacity: 0.2, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={revealTransition}
            className="mx-auto max-w-3xl"
          >
            <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
              <span className="h-3 w-[2px] shrink-0 bg-primary" />
              Manifesto
            </p>
            <h1 className="mt-5 font-display text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
              Aletheia
            </h1>
            <p className="mt-4 font-serif text-xl leading-[1.9] text-slate-100/92 md:text-2xl">
              Truth revealed through data.
            </p>
            <div className="mt-7 h-px w-24 bg-primary/40" />
          </motion.header>

          <section className="mx-auto mt-12 max-w-3xl space-y-7 md:mt-14 md:space-y-8" aria-label="Opening principles">
            {charterLead.map((paragraph, index) => (
              <motion.p
                key={paragraph}
                initial={{ opacity: 0.2, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...revealTransition, delay: index * 0.05 }}
                className="font-serif text-lg leading-[2] text-slate-100/88"
              >
                {paragraph}
              </motion.p>
            ))}
          </section>

          <section className="mx-auto mt-14 max-w-3xl space-y-7 md:mt-16 md:space-y-8" aria-label="Mission and vision">
            {charterCore.map((paragraph, index) => (
              <motion.p
                key={paragraph}
                initial={{ opacity: 0.2, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...revealTransition, delay: index * 0.06 }}
                className="font-serif text-lg leading-[2] text-slate-100/88"
              >
                {paragraph}
              </motion.p>
            ))}
          </section>

          <motion.section
            initial={{ opacity: 0.2, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={revealTransition}
            className="mx-auto mt-16 max-w-3xl border-y border-white/[0.08] py-10 md:mt-20 md:py-12"
            aria-label="Core beliefs"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55">
              We Believe
            </h2>
            <ul className="mt-6 space-y-5 md:space-y-6">
              {beliefs.map((belief, index) => (
                <motion.li
                  key={belief}
                  initial={{ opacity: 0.2, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ ...revealTransition, delay: index * 0.05 }}
                  className="font-serif text-xl leading-[1.9] text-slate-100/92"
                >
                  {belief}
                </motion.li>
              ))}
            </ul>
          </motion.section>

          <section className="mx-auto mt-14 max-w-3xl space-y-7 md:mt-16 md:space-y-8" aria-label="Closing commitment">
            {charterClose.map((paragraph, index) => (
              <motion.p
                key={paragraph}
                initial={{ opacity: 0.2, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ ...revealTransition, delay: index * 0.06 }}
                className="font-serif text-lg leading-[2] text-slate-100/88"
              >
                {paragraph}
              </motion.p>
            ))}
          </section>

          <motion.footer
            initial={{ opacity: 0.2, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={revealTransition}
            className="mx-auto mt-14 max-w-3xl border-l border-primary/40 pl-5 md:mt-16"
          >
            <p className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Truth. Service. Innovation with Purpose.
            </p>
            <p className="mt-3 font-serif text-lg leading-[1.9] text-slate-100/90">
              Technology that leaves the world better than we found it.
            </p>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Motto: Wisdom through data.
            </p>
          </motion.footer>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default Aletheia;