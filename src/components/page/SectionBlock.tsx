import type { ReactNode } from "react";
import { motion } from "framer-motion";

type SectionBlockProps = {
  eyebrow: string;
  title?: ReactNode;
  children: ReactNode;
  /** Softer background band */
  tone?: "default" | "panel";
};

/** Standard interior-page section: eyebrow label + optional title + content. */
const SectionBlock = ({ eyebrow, title, children, tone = "default" }: SectionBlockProps) => {
  return (
    <section
      className={`relative border-b border-white/[0.06] py-12 md:py-16 ${
        tone === "panel" ? "bg-[hsl(213,38%,7%)]" : "bg-[#0a0c10]"
      }`}
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-3 w-[2px] shrink-0 bg-primary" />
            {eyebrow}
          </span>
          {title && (
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {title}
            </h2>
          )}
          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionBlock;
