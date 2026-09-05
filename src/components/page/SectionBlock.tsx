import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

type SectionBlockProps = {
  eyebrow: string;
  title?: ReactNode;
  children: ReactNode;
  /** Softer background band */
  tone?: "default" | "panel";
  /** Anchor target for in-page navigation; offset so a sticky bar can't cover it. */
  id?: string;
};

/** Standard interior-page section: eyebrow label + optional title + content. */
const SectionBlock = ({ eyebrow, title, children, tone = "default", id }: SectionBlockProps) => {
  return (
    <section
      id={id}
      className={`relative scroll-mt-[7.5rem] border-b border-foreground/[0.06] py-12 md:py-16 ${
        tone === "panel" ? "bg-surface-sunken" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: DUR.reveal, ease: EASE }}
        >
          <span className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-meta">
            <span className="h-3 w-[2px] shrink-0 accent-bar" />
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
