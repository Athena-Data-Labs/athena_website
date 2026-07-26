import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { resolveFieldNoteSlug } from "@/lib/redirects";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { lazy, Suspense } from "react";
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

const App = () => (
  <ThemeProvider defaultTheme="dark" forcedTheme="dark" storageKey="athena-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MotionConfig reducedMotion="user">
          <BrowserRouter>
            <Suspense fallback={<div className="min-h-screen bg-background" />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
