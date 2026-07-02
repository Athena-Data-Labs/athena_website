import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Crumb = { label: string; to: string };

type PageShellProps = {
  /** Small uppercase label above the h1 */
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  /** Back-link trail; defaults to home */
  breadcrumb?: Crumb;
  /** Extra content inside the header, below the intro (e.g. meta rows) */
  headerExtra?: ReactNode;
  /** "compact" for long article/case-study titles */
  titleSize?: "default" | "compact";
  children: ReactNode;
};

/**
 * Standard interior-page frame: navbar, flat hero header with breadcrumb,
 * eyebrow, title, intro — then the page body and footer. Matches the
 * established flat design (near-black surfaces, hairlines, gold accents).
 */
const PageShell = ({ eyebrow, title, intro, breadcrumb, headerExtra, titleSize = "default", children }: PageShellProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const crumb = breadcrumb ?? { label: "Athena Data Labs", to: "/" };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="relative border-b border-white/[0.06] bg-[#0a0c10] pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-6">
          <Link
            to={crumb.to}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} /> {crumb.label}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-8 max-w-3xl"
          >
            <span className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">
              <span className="h-3.5 w-[2px] shrink-0 bg-primary" />
              {eyebrow}
            </span>
            <h1
              className={`mt-5 font-display font-black leading-[1.08] tracking-[-0.03em] text-white ${
                titleSize === "compact" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {title}
            </h1>
            <div className="mt-5 h-px w-24 bg-primary/40" />
            {intro && (
              <p className="mt-5 max-w-2xl text-base leading-[1.72] text-slate-100/90 md:text-lg">
                {intro}
              </p>
            )}
            {headerExtra}
          </motion.div>
        </div>
      </header>

      {children}

      <Footer />
    </div>
  );
};

export default PageShell;
