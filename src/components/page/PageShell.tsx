import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import AtmosphereField from "@/components/hero/AtmosphereField";
import ClosingPanel from "@/components/ClosingPanel";
import GreekMark, { GreekGloss, type GreekTerm } from "@/components/page/GreekMark";
import { EASE } from "@/lib/motion";

const PAGE_WINDOWS = ["#page-header", "#consultation-cta", "#closing-panel"];

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
  /** The Greek word this page is anchored to. Landing pages only. */
  greek?: GreekTerm;
  /**
   * Short name for the navbar to show once this h1 scrolls away. Article
   * headlines are written to be read at 48px and do not fit a toolbar, so a
   * page with a long one passes its search-tuned title here instead.
   */
  toolbarTitle?: string;
  children: ReactNode;
};

/**
 * Standard interior-page frame: navbar, flat hero header with breadcrumb,
 * eyebrow, title, intro — then the page body and footer. Matches the
 * established flat design (near-black surfaces, hairlines, gold accents).
 */
const PageShell = ({
  eyebrow,
  title,
  intro,
  breadcrumb,
  headerExtra,
  titleSize = "default",
  greek,
  toolbarTitle,
  children,
}: PageShellProps) => {
  /* Instant, not smooth. The page-level `scroll-behavior: smooth` applies to
     this too, so a plain scrollTo(0, 0) animates the reader all the way up
     through a document they have not seen yet — and on a route change it also
     means the bar stays condensed for most of a second after the click, then
     un-condenses and drags the sliding tab underline off the mark it had just
     landed on. HashScroll already opts out of smooth for the same reason. */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const crumb = breadcrumb ?? { label: "Athena Data Labs", to: "/" };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed background plane shared with the homepage, run well back: the
          header below is a transparent window onto it, body sections are opaque
          panels above it, and the transparent ConsultationCta re-reveals it
          before the footer. Once the header leaves the viewport the renderer
          throttles itself — a page of prose should not cost a GPU. */}
      <AtmosphereField
        watch={PAGE_WINDOWS}
        intensity={0.5}
        guard="even"
        scrollMode="document"
        revealOn="mount"
      />

      {/* No bottom rule. The header and the body below it are both windows onto
          the same fixed plane, so a hairline between them divides nothing — it
          just draws a line across the page. Spacing does the separating. */}
      <header
        id="page-header"
        className="relative z-10 overflow-hidden bg-transparent pb-10 pt-28 md:pb-12 md:pt-32"
      >
        {greek && <GreekMark term={greek} />}
        <div className="container relative mx-auto px-6">
          <Link
            to={crumb.to}
            data-print-hide
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-steel"
          >
            <ArrowLeft size={14} /> {crumb.label}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-8 max-w-3xl"
          >
            <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-foreground/55">
              <span className="flex items-center gap-2.5">
                <span className="h-3.5 w-[2px] shrink-0 bg-steel" />
                {eyebrow}
              </span>
              {greek && <GreekGloss term={greek} />}
            </span>
            <h1
              data-toolbar-title={toolbarTitle}
              className={`mt-5 font-display font-black leading-[1.08] tracking-[-0.03em] text-foreground ${
                titleSize === "compact" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {title}
            </h1>
            <div className="mt-5 h-px w-24 bg-steel/40" />
            {intro && (
              <p className="mt-5 max-w-2xl text-base leading-[1.72] text-foreground/85 md:text-lg">
                {intro}
              </p>
            )}
            {headerExtra}
          </motion.div>
        </div>
      </header>

      {/* Positioned layer so every body section (opaque or window) paints above the fixed backdrop */}
      <div className="relative z-10">{children}</div>

      {/* Not a footer: a full screen the page has been lying on top of, and
          uncovered by the last one of scrolling. It carries the entity name and
          the certifications the footer used to; the four columns of sitemap
          links are on the top navigation of every page. See `ClosingPanel`. */}
      <ClosingPanel />
    </div>
  );
};

export default PageShell;
