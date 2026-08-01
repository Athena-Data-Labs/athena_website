import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import Preloader from "@/components/hero/Preloader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProofTeaser from "@/components/ProofTeaser";
import SignalBand from "@/components/SignalBand";

// The field carries the WebGL pipeline and its shaders. Splitting it out keeps
// it off the critical path — the headline is the LCP element, and it should not
// wait behind a renderer that has nothing to draw until first paint anyway.
const AtmosphereField = lazy(() => import("@/components/hero/AtmosphereField"));
const FeaturedResources = lazy(() => import("@/components/FeaturedResources"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ClientReviews = lazy(() => import("@/components/ClientReviews"));
const CtaSection = lazy(() => import("@/components/CtaSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

/** Sections cut out of the background plane — the field idles when none are on screen. */
const WINDOWS = ["#hero", "#signal-band"];

/**
 * Homepage hub: hero → services (each with its receipt) → featured products →
 * featured resources → why Athena → client reviews → CTA. Each section links
 * deeper into the site.
 */
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Decision Intelligence Systems"
        description="A decision intelligence studio building BI platforms, forecasting systems and AI agents. Every product on this site was built, shipped and is run by us."
        path="/"
      />
      <Preloader />
      {/* Deepest layer: fixed, raymarched background plane. The hero and
          SignalBand are transparent windows onto it; every other section is an
          opaque panel scrolling above it. */}
      <Suspense fallback={null}>
        <AtmosphereField watch={WINDOWS} />
      </Suspense>
      <HeroSection />
      <ServicesSection />
      <ProofTeaser />
      <SignalBand />
      <Suspense fallback={<SectionFallback />}>
        <FeaturedResources />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <AboutSection />
      </Suspense>
      {/* Our own case for ourselves, then someone else's. In that order, and
          immediately before the form that asks them to get in touch. */}
      <Suspense fallback={<SectionFallback />}>
        <ClientReviews />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CtaSection />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
