import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { resolveFieldNoteSlug } from "@/lib/redirects";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
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
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

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
    className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-[70] focus:border focus:border-primary/60 focus:bg-[#0a0c10] focus:px-4 focus:py-2.5 focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.16em] focus:text-primary"
  >
    Skip to content
  </a>
);

const App = () => (
  <ThemeProvider defaultTheme="dark" forcedTheme="dark" storageKey="athena-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <Shell />
          </BrowserRouter>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
