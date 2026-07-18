import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import NeuralBackdrop from "@/components/NeuralBackdrop";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProofTeaser from "@/components/ProofTeaser";
import SignalBand from "@/components/SignalBand";
import Footer from "@/components/Footer";

const FeaturedResources = lazy(() => import("@/components/FeaturedResources"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const CtaSection = lazy(() => import("@/components/CtaSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

/**
 * Homepage hub: hero → services overview → featured products → featured
 * resources → why Athena → CTA. Each section links deeper into the site.
 */
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Business Intelligence, AI Agents & Data Products"
        description="Athena Data Labs designs and ships data products: business intelligence platforms, forecasting systems, and AI agents. Built and shipped by the team that stands behind them."
        path="/"
      />
      <Navbar />
      {/* Deepest layer: fixed background plane. The hero and SignalBand are
          transparent windows onto it; every other section is an opaque panel
          scrolling above it. */}
      <NeuralBackdrop />
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
      <Suspense fallback={<SectionFallback />}>
        <CtaSection />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
