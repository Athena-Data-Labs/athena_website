import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/hero/Preloader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProofTeaser from "@/components/ProofTeaser";
import ReceiptsBand from "@/components/ReceiptsBand";
import SignalBand from "@/components/SignalBand";
import Footer from "@/components/Footer";

// The field carries the WebGL pipeline and its shaders. Splitting it out keeps
// it off the critical path — the headline is the LCP element, and it should not
// wait behind a renderer that has nothing to draw until first paint anyway.
const AtmosphereField = lazy(() => import("@/components/hero/AtmosphereField"));
const FeaturedResources = lazy(() => import("@/components/FeaturedResources"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const CtaSection = lazy(() => import("@/components/CtaSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

/** Sections cut out of the background plane — the field idles when none are on screen. */
const WINDOWS = ["#hero", "#signal-band"];

/**
 * Homepage hub: hero → services overview → the receipts for those services →
 * featured products → featured resources → why Athena → CTA. Each section links
 * deeper into the site.
 */
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Decision Intelligence Systems"
        description="Athena Data Labs is a decision intelligence studio: business intelligence platforms, forecasting systems, and AI agents. Every product on the site was built, shipped, and is run by us."
        path="/"
      />
      <Preloader />
      <Navbar />
      {/* Deepest layer: fixed, raymarched background plane. The hero and
          SignalBand are transparent windows onto it; every other section is an
          opaque panel scrolling above it. */}
      <Suspense fallback={null}>
        <AtmosphereField watch={WINDOWS} />
      </Suspense>
      <HeroSection />
      <ServicesSection />
      <ReceiptsBand />
      <ProofTeaser />
      <SignalBand />
      <Suspense fallback={<SectionFallback />}>
        <FeaturedResources />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CtaSection />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
