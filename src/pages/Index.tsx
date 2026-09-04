import { lazy, Suspense, useEffect, useState } from "react";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import ClosingPanel from "@/components/ClosingPanel";
import Preloader from "@/components/hero/Preloader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ProofTeaser from "@/components/ProofTeaser";
import SignalBand from "@/components/SignalBand";
import { CLOSED } from "@/components/hero/reveal-timing";

// The field carries the WebGL pipeline and its shaders. Splitting it out keeps
// it off the critical path — the headline is the LCP element, and it should not
// wait behind a renderer that has nothing to draw until first paint anyway.
const AtmosphereField = lazy(() => import("@/components/hero/AtmosphereField"));
const CollisionReveal = lazy(() => import("@/components/hero/CollisionReveal"));

const FeaturedResources = lazy(() => import("@/components/FeaturedResources"));
const GovConBand = lazy(() => import("@/components/GovConBand"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ReviewRail = lazy(() => import("@/components/ReviewRail"));
const CtaSection = lazy(() => import("@/components/CtaSection"));

const SectionFallback = () => <div className="h-24" aria-hidden="true" />;

/** Sections cut out of the background plane — the field idles when none are on screen. */
const WINDOWS = ["#hero", "#signal-band", "#closing-panel"];

/**
 * Which ending the homepage gets, and it is the only page where that is a
 * question.
 *
 * Every other page ends with her, because interior pages have no other place to
 * put her — the closing panel *is* their ending. The homepage does not need it:
 * it has the reveal, which is the better version of the same idea, the
 * collision contracting into her hands with a whole hero to do it in.
 *
 * But the reveal is desktop-only. It wants a scroll runway the mobile hero does
 * not have, and it is gated on a fine pointer besides — so on a phone the
 * homepage was the one page with no Athena on it at all, which is the page most
 * people arrive on. Below the reveal's own breakpoint the panel takes the
 * footer's place here exactly as it does everywhere else.
 *
 * What that costs is the four columns of sitemap links, and it costs less here
 * than it looks: the top navigation carries every one of them, and on a phone
 * those columns are already a long stack nobody reads. The panel keeps the
 * entity line and the certifications.
 *
 * The default is the footer, and deliberately. This runs during prerender with
 * no window, and the footer's links are the homepage's internal linking — they
 * belong in the HTML a crawler is served regardless of what a phone swaps in
 * after hydration.
 */
const NARROW = "(max-width: 1023px)";

/**
 * Homepage hub: hero → services (each with its receipt) → all four products →
 * signal band → featured resources → why Athena → client reviews → CTA. Each
 * section links deeper into the site.
 *
 * "All four", not "featured": ProofTeaser deliberately gives every product the
 * same tile in one grid. They are evidence for the services above them — the
 * heading is "Four Products, In Production" and the copy answers the question
 * clients actually ask, "could you build us something like this?" — so
 * promoting one would turn a credential into a storefront and weaken the claim
 * the section exists to make.
 */
const Index = () => {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
        <CollisionReveal>
          {/* The plane opens up as it contracts. Every other page keeps the
              resting exposure, because on those it is still a full-viewport
              backdrop with copy read over it. */}
          <AtmosphereField watch={WINDOWS} gain={1.5} contractOver={CLOSED} drain={0.12} pointerGain={2.6} />
        </CollisionReveal>
      </Suspense>
      <HeroSection />
      <ServicesSection />
      <ProofTeaser />
      {/* Straight after the proof: the products are the evidence, and this is
          the line of business the evidence is being offered to. */}
      <Suspense fallback={<SectionFallback />}>
        <GovConBand />
      </Suspense>
      <SignalBand />
      <Suspense fallback={<SectionFallback />}>
        <FeaturedResources />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <AboutSection />
      </Suspense>
      {/* Our own case for ourselves, then someone else's. In that order, and
          immediately before the form that asks them to get in touch.

          Excerpts, not the full reviews: this is the front door, and four
          full-length testimonials here is a wall that gets scrolled past whole.
          The rail links to About, which prints all of them unedited. */}
      <Suspense fallback={<SectionFallback />}>
        <ReviewRail />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CtaSection />
      </Suspense>
      {narrow ? <ClosingPanel /> : <Footer />}
    </div>
  );
};

export default Index;
