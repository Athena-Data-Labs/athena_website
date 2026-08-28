import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { resolveFieldNoteSlug } from "@/lib/redirects";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteBoundary from "@/components/RouteBoundary";
import { recoverFromStaleChunk } from "@/lib/stale-chunk";
import Index from "./pages/Index";

// Secondary routes are code-split so they don't weigh down the initial homepage load.
const ServicesIndex = lazy(() => import("./pages/services/ServicesIndex"));
const ServiceDetail = lazy(() => import("./pages/services/ServiceDetail"));
const ProductsIndex = lazy(() => import("./pages/products/ProductsIndex"));
const ProductDetail = lazy(() => import("./pages/products/ProductDetail"));
const ResourcesIndex = lazy(() => import("./pages/resources/ResourcesIndex"));
const CaseStudiesIndex = lazy(() => import("./pages/resources/CaseStudiesIndex"));
const CaseStudyDetail = lazy(() => import("./pages/resources/CaseStudyDetail"));
const FieldNotesIndex = lazy(() => import("./pages/resources/FieldNotesIndex"));
const FieldNoteDetail = lazy(() => import("./pages/resources/FieldNoteDetail"));
const About = lazy(() => import("./pages/About"));
const Aletheia = lazy(() => import("./pages/Aletheia"));
const Contact = lazy(() => import("./pages/Contact"));
const Government = lazy(() => import("./pages/Government"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** /resources/insights/:slug → the same article's new home, alias-aware. */
const LegacyInsightRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Navigate
      to={slug ? `/resources/field-notes/${resolveFieldNoteSlug(slug)}` : "/resources/field-notes"}
      replace
    />
  );
};

/**
 * Takes a #hash to the section it names. Nothing in this app did, so a link to
 * /about#reviews landed at the top of About with the section it promised 3,700px
 * further down — a browser resolves a fragment against the document it was
 * served, and every route here is served the same shell with an empty body.
 *
 * The target usually does not exist yet when the hash arrives: pages are lazy,
 * their sections are lazy again inside them, and both have to land before there
 * is an element to scroll to. So this retries per frame and then gives up, which
 * is also the honest answer for a hash naming a section that never existed.
 *
 * Instant rather than smooth, because the page-level `scroll-behavior: smooth`
 * would otherwise animate a cold load through the whole document to get there.
 */
const HashScroll = () => {
  const { pathname, hash } = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const cameFromAnotherRoute = lastPath.current !== null && lastPath.current !== pathname;
    lastPath.current = pathname;
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    let frames = 0;
    let raf = 0;

    /* The page being left behind can own this id too — the homepage rail and
       About's full list are both #reviews, which is correct, since each is its
       page's reviews section. But during the route cross-fade both the outgoing
       and incoming page exist, so the first match found on a route change is the
       one that is about to be unmounted: scrolling to it looked like success and
       left the reader at the top of the new page.

       AnimatePresence runs in "wait" mode, so it takes the old page out before it
       puts the new one in. That gap is the signal. Wait for the id to go absent
       before believing a match. Nothing to wait for when the hash changed within
       one page, and nothing to wait for when the outgoing page never had the id
       — the very first look comes back empty and clears it. */
    let outgoingCleared = !cameFromAnotherRoute;

    const attempt = () => {
      const target = document.getElementById(id);
      if (!outgoingCleared) {
        if (!target) outgoingCleared = true;
      } else if (target) {
        /* The navbar is fixed, so landing the section at viewport top puts its
           first line underneath it — every anchored section on the site opened
           with its eyebrow hidden. Measured rather than hardcoded because the
           bar is a different height on mobile, and clamped because an open
           mobile menu makes the same element several hundred pixels tall and
           would otherwise throw the landing far short of the heading. */
        const header = document.querySelector("header");
        const bar = header ? Math.min(header.getBoundingClientRect().height, 80) : 0;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - bar - 16,
          behavior: "instant",
        });
        return;
      }
      // ~3s at 60fps. Long enough for a lazy route and its lazy sections on a
      // slow connection, short enough not to hijack a scroll the reader started.
      if (frames++ < 180) raf = requestAnimationFrame(attempt);
    };

    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
};

/** Routes wrapped in a subtle cross-fade so navigation feels like one continuous product. */
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />

          <Route path="/services" element={<ServicesIndex />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />

          <Route path="/products" element={<ProductsIndex />} />
          <Route path="/products/:slug" element={<ProductDetail />} />

          <Route path="/resources" element={<ResourcesIndex />} />
          <Route path="/resources/case-studies" element={<CaseStudiesIndex />} />
          <Route path="/resources/case-studies/:slug" element={<CaseStudyDetail />} />
          <Route path="/resources/field-notes" element={<FieldNotesIndex />} />
          <Route path="/resources/field-notes/:slug" element={<FieldNoteDetail />} />

          <Route path="/about" element={<About />} />
          <Route path="/aletheia" element={<Aletheia />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/government" element={<Government />} />

          {/* Old /labs URL preserved as a redirect so existing links don't 404. */}
          <Route path="/labs" element={<Navigate to="/products" replace />} />

          {/* Insights became Field Notes. Both old paths are indexed, so both
              still resolve; CaseStudyDetail forwards the three write-ups that
              moved collections. */}
          <Route path="/resources/insights" element={<Navigate to="/resources/field-notes" replace />} />
          <Route path="/resources/insights/:slug" element={<LegacyInsightRedirect />} />

          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * The header, mounted once for the lifetime of the app.
 *
 * It used to be rendered by each page, which put it inside both the route
 * cross-fade and the lazy-route Suspense boundary: every navigation unmounted
 * and rebuilt it, and any route whose chunk was not already in memory replaced
 * it with a blank screen until the download finished. Hoisting it means the
 * header never unmounts, its entry animation plays once, and a slow chunk costs
 * you the page body only.
 *
 * The footer stays with the pages on purpose. Its feathered top edge is decided
 * by `.panel + .panel` against whatever section precedes it, and that adjacency
 * only exists while it is the page's last child.
 */
const Shell = () => {
  useEffect(() => {
    // Vite raises this when a module preload 404s, which is the same stale-deploy
    // situation RouteBoundary handles but surfaces outside of React's render.
    const onPreloadError = (event: Event) => {
      if (recoverFromStaleChunk()) event.preventDefault();
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  return (
    <>
      <SkipLink />
      {/* Here rather than beside the routes, so it sits outside AnimatePresence:
          that tracks its children by key to decide what is entering and leaving,
          and an unkeyed sibling has no business in there. */}
      <HashScroll />
      <Navbar />
      {/* Wrapping the routes rather than each page: one `main` landmark for the
          life of the app, and no change to any sibling relationship inside a
          page — the panel feathering is decided by `.panel + .panel`, which
          only sees adjacency, and the fixed background plane still resolves
          against the viewport because nothing here establishes a containing
          block. */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <RouteBoundary>
          <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
            <AnimatedRoutes />
          </Suspense>
        </RouteBoundary>
      </main>
    </>
  );
};

/**
 * First thing in the tab order, on every page. Without it a keyboard or screen
 * reader user walks the seven-item header and the dashboard button before
 * reaching the content — again on every navigation.
 *
 * It sits here rather than inside the Navbar because the header animates in on
 * a transform, and a transformed ancestor makes `position: fixed` resolve
 * against the header instead of the viewport.
 */
const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-[70] focus:border focus:border-primary/60 focus:bg-background focus:px-4 focus:py-2.5 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.16em] focus:text-primary"
  >
    Skip to content
  </a>
);

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="athena-theme">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </MotionConfig>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
