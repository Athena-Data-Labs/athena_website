import { lazy, Suspense } from "react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProofTeaser from "@/components/ProofTeaser";
import Footer from "@/components/Footer";

const FeaturedResources = lazy(() => import("@/components/FeaturedResources"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ConsultationCta = lazy(() => import("@/components/ConsultationCta"));
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
        description="Athena Data Labs designs and ships intelligent data products — AI-driven business intelligence, predictive modeling, and autonomous agents that turn data into confident decisions."
        path="/"
      />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <ProofTeaser />
      <Suspense fallback={<SectionFallback />}>
        <FeaturedResources />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ConsultationCta />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CtaSection />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
